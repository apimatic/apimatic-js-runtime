import { getHeader } from '@apimatic/http-headers';
import {
  createSignatureVerificationFailure,
  createSignatureVerificationSuccess,
  HttpRequest,
  SignatureVerificationResult,
  SignatureVerifier,
} from '@apimatic/core-interfaces';
import { createHmac, timingSafeEqual } from 'crypto';

type HmacEncoding = 'hex' | 'base64' | 'base64url';
type HmacAlgorithm = 'sha256' | 'sha512';

export class HmacSignatureVerifier implements SignatureVerifier {
  private readonly secretKey: string;
  private readonly encoding: HmacEncoding;
  private readonly signatureHeader: string;
  private readonly signatureValueTemplate: string | undefined;
  private readonly hmacAlgorithm: HmacAlgorithm;
  private readonly templateResolver: ((req: HttpRequest) => Buffer) | undefined;

  constructor(
    secretKey: string,
    signatureHeader: string,
    templateResolver?: (req: HttpRequest) => Buffer,
    hmacAlgorithm: HmacAlgorithm = 'sha256',
    encoding: HmacEncoding = 'hex',
    signatureValueTemplate?: string
  ) {
    if (typeof secretKey !== 'string' || !secretKey.trim()) {
      throw new Error('secretKey must be a non-empty string');
    }
    if (typeof signatureHeader !== 'string' || !signatureHeader.trim()) {
      throw new Error('signatureHeader must be a non-empty string');
    }
    if (
      templateResolver !== undefined &&
      typeof templateResolver !== 'function'
    ) {
      throw new Error('templateResolver must be a function if provided');
    }
    if (hmacAlgorithm !== 'sha256' && hmacAlgorithm !== 'sha512') {
      throw new Error(`hmacAlgorithm must be either 'sha256' or 'sha512'`);
    }
    if (
      encoding !== 'hex' &&
      encoding !== 'base64' &&
      encoding !== 'base64url'
    ) {
      throw new Error(
        `encoding must be either 'hex' or 'base64' or 'base64url'`
      );
    }
    if (
      typeof signatureValueTemplate !== 'string' &&
      typeof signatureValueTemplate !== 'undefined'
    ) {
      throw new Error('signatureValueTemplate must be a string');
    }

    this.secretKey = secretKey;
    this.signatureHeader = signatureHeader;
    this.hmacAlgorithm = hmacAlgorithm;
    this.encoding = encoding;
    this.signatureValueTemplate = signatureValueTemplate;
    this.templateResolver = templateResolver;
  }

  public verify(req: HttpRequest): SignatureVerificationResult {
    const headers = req.headers;
    if (!headers) {
      return createSignatureVerificationFailure('Missing request headers');
    }

    const signatureHeader = getHeader(headers, this.signatureHeader);
    if (!signatureHeader) {
      return createSignatureVerificationFailure('Missing signature header');
    }

    const resolvedTemplate = this.templateResolver?.(req);

    let bodyContent = '';
    if (req.body?.type === 'text') {
      bodyContent = req.body.content;
    }

    const signingBytes =
      resolvedTemplate &&
      Buffer.isBuffer(resolvedTemplate) &&
      resolvedTemplate.length > 0
        ? resolvedTemplate
        : Buffer.from(bodyContent, 'utf8');

    let calculatedSignature = createHmac(this.hmacAlgorithm, this.secretKey)
      .update(signingBytes)
      .digest(this.encoding === 'base64url' ? 'base64' : this.encoding);

    if (this.encoding === 'base64url') {
      calculatedSignature = this.toBase64Url(calculatedSignature);
    }

    if (this.signatureValueTemplate !== undefined) {
      calculatedSignature = this.signatureValueTemplate.replace(
        '{digest}',
        calculatedSignature
      );
    }

    const received = Buffer.from(signatureHeader, 'utf8');
    const expected = Buffer.from(calculatedSignature, 'utf8');

    const match =
      received.length === expected.length &&
      timingSafeEqual(received, expected);

    return match
      ? createSignatureVerificationSuccess()
      : createSignatureVerificationFailure('Signature mismatch');
  }

  private toBase64Url(base64: string): string {
    let result = '';
    for (const ch of base64) {
      if (ch === '+') {
        result += '-';
      } else if (ch === '/') {
        result += '_';
      } else if (ch === '=') {
        continue;
      } else {
        result += ch;
      }
    }
    return result;
  }
}
