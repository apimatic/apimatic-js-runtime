import { HmacSignatureVerifier } from '../src/hmacSignatureVerifier';
import {
  createSignatureVerificationFailure,
  getValueByJsonPointer,
  getHeader,
  HttpRequest,
} from '@apimatic/core';
import { createHmac } from 'crypto';

describe('HmacSignatureVerifier', () => {
  const secretKey = 'test_secret';
  const signatureHeader = 'X-Signature';

  const templateResolver = (request: HttpRequest) => {
    const method = request.method ?? '';
    const body = request.body?.type === 'text' ? request.body.content : '';
    const cookieHeader = getHeader(request.headers ?? {}, 'Cookie') ?? '';
    const xTimestampHeader =
      getHeader(request.headers ?? {}, 'X-Timestamp') ?? '';
    const customerName =
      getValueByJsonPointer(request.body, '/customer/name') ?? '';

    const finalMessage = `${cookieHeader}:${xTimestampHeader}:${method}:${body}:${customerName}`;

    return Buffer.from(finalMessage, 'utf-8');
  };

  const hmacAlgorithm = 'SHA256';
  const encoding = 'hex';
  const signatureValueTemplate = 'sha256={digest}';

  const baseRequest: HttpRequest = {
    method: 'POST',
    url: 'https://api.example.com/resource',
    headers: {
      'Content-Type': 'application/json',
      'X-Timestamp': '1697051234',
      'X-Signature': '',
    },
    body: { type: 'text', content: '{"foo":"bar"}' },
  };

  it('should throw error for invalid constructor arguments', () => {
    expect(
      () => new HmacSignatureVerifier('', signatureHeader, templateResolver)
    ).toThrow();
    expect(
      () => new HmacSignatureVerifier(secretKey, '', templateResolver)
    ).toThrow();
    expect(
      () =>
        new HmacSignatureVerifier(secretKey, signatureHeader, 'invalid' as any)
    ).toThrow();
    expect(
      () =>
        new HmacSignatureVerifier(
          secretKey,
          signatureHeader,
          templateResolver,
          'invalid' as any
        )
    ).toThrow();
    expect(
      () =>
        new HmacSignatureVerifier(
          secretKey,
          signatureHeader,
          templateResolver,
          hmacAlgorithm,
          'invalid' as any
        )
    ).toThrow();
    expect(
      () =>
        new HmacSignatureVerifier(
          secretKey,
          signatureHeader,
          templateResolver,
          hmacAlgorithm,
          encoding,
          123 as any
        )
    ).toThrow();
  });

  it('should fail verification if headers are missing', () => {
    const verifier = new HmacSignatureVerifier(
      secretKey,
      signatureHeader,
      templateResolver
    );
    const req = { ...baseRequest, headers: undefined };
    const result = verifier.verify(req);
    expect(result.success).toBe(false);
    expect(result).toEqual(
      createSignatureVerificationFailure('Missing request headers')
    );
  });

  it('should fail verification if signature header is missing', () => {
    const verifier = new HmacSignatureVerifier(
      secretKey,
      signatureHeader,
      templateResolver
    );
    const req = {
      ...baseRequest,
      headers: { 'Content-Type': 'application/json' },
    };
    const result = verifier.verify(req);
    expect(result.success).toBe(false);
    expect(result).toEqual(
      createSignatureVerificationFailure('Missing signature header')
    );
  });

  it('should fail verification if signature does not match', () => {
    const verifier = new HmacSignatureVerifier(
      secretKey,
      signatureHeader,
      templateResolver
    );
    const req = {
      ...baseRequest,
      headers: {
        ...baseRequest.headers,
        'X-Signature': 'sha256=invalidsignature',
      },
    };
    const result = verifier.verify(req);
    expect(result.success).toBe(false);
    expect(result).toEqual(
      createSignatureVerificationFailure('Signature mismatch')
    );
  });

  it('should pass verification for valid signature', () => {
    const verifier = new HmacSignatureVerifier(
      secretKey,
      signatureHeader,
      templateResolver,
      undefined,
      undefined,
      signatureValueTemplate
    );
    const signingBytes = templateResolver(baseRequest);
    const digest = createHmac(hmacAlgorithm, secretKey)
      .update(signingBytes)
      .digest(encoding);
    const signature = signatureValueTemplate.replace('{digest}', digest);
    const req = {
      ...baseRequest,
      headers: { ...baseRequest.headers, 'X-Signature': signature },
    };
    const result = verifier.verify(req);
    expect(result.success).toBe(true);
  });

  it('should pass verification for valid signature without signatureValueTemplate', () => {
    const verifier = new HmacSignatureVerifier(
      secretKey,
      signatureHeader,
      templateResolver,
      undefined,
      undefined
    );
    const signingBytes = templateResolver(baseRequest);
    const digest = createHmac(hmacAlgorithm, secretKey)
      .update(signingBytes)
      .digest(encoding);
    const req = {
      ...baseRequest,
      headers: { ...baseRequest.headers, 'X-Signature': digest },
    };
    const result = verifier.verify(req);
    expect(result.success).toBe(true);
  });

  it('should support sha512 and base64 encoding', () => {
    const verifier = new HmacSignatureVerifier(
      secretKey,
      signatureHeader,
      templateResolver,
      'SHA512',
      'base64'
    );
    const signingBytes = templateResolver(baseRequest);
    const digest = createHmac('SHA512', secretKey)
      .update(signingBytes)
      .digest('base64');
    const req = {
      ...baseRequest,
      headers: { ...baseRequest.headers, 'X-Signature': digest },
    };
    const result = verifier.verify(req);
    expect(result.success).toBe(true);
  });

  it('should support base64url encoding', () => {
    const base64urlEncode = (base64: string) => {
      let base64url = '';
      for (const ch of base64) {
        if (ch === '+') {
          base64url += '-';
        } else if (ch === '/') {
          base64url += '_';
        } else if (ch === '=') {
          continue;
        } else {
          base64url += ch;
        }
      }
      return base64url;
    };
    const verifier = new HmacSignatureVerifier(
      secretKey,
      signatureHeader,
      templateResolver,
      'SHA512',
      'base64url'
    );
    const signingBytes = templateResolver(baseRequest);
    const digest = base64urlEncode(
      createHmac('SHA512', secretKey).update(signingBytes).digest('base64')
    );
    const req = {
      ...baseRequest,
      headers: { ...baseRequest.headers, 'X-Signature': digest },
    };
    const result = verifier.verify(req);
    expect(result.success).toBe(true);
  });

  it('should use custom signature value template', () => {
    const customTemplate = 'sig:{digest}:end';
    const verifier = new HmacSignatureVerifier(
      secretKey,
      signatureHeader,
      templateResolver,
      hmacAlgorithm,
      encoding,
      customTemplate
    );
    const signingBytes = templateResolver(baseRequest);
    const digest = createHmac(hmacAlgorithm, secretKey)
      .update(signingBytes)
      .digest(encoding);
    const signature = customTemplate.replace('{digest}', digest);
    const req = {
      ...baseRequest,
      headers: { ...baseRequest.headers, 'X-Signature': signature },
    };
    const result = verifier.verify(req);
    expect(result.success).toBe(true);
  });

  it('should fail if different secret key is given', () => {
    const verifier = new HmacSignatureVerifier(
      'different-key',
      signatureHeader,
      templateResolver,
      undefined,
      undefined,
      signatureValueTemplate
    );
    const signingBytes = templateResolver(baseRequest);
    const digest = createHmac(hmacAlgorithm, secretKey)
      .update(signingBytes)
      .digest(encoding);
    const signature = signatureValueTemplate.replace('{digest}', digest);
    const req = {
      ...baseRequest,
      headers: { ...baseRequest.headers, 'X-Signature': signature },
    };
    const result = verifier.verify(req);
    expect(result.success).toBe(false);
  });

  it('should use body to sign if template resolver is not provided', () => {
    const verifier = new HmacSignatureVerifier(
      'different-key',
      signatureHeader,
      undefined,
      undefined,
      undefined,
      signatureValueTemplate
    );
    const signingBytes = Buffer.from(
      baseRequest.body?.type === 'text' ? baseRequest.body.content : '',
      'utf8'
    );
    const digest = createHmac(hmacAlgorithm, secretKey)
      .update(signingBytes)
      .digest(encoding);
    const signature = signatureValueTemplate.replace('{digest}', digest);
    const req = {
      ...baseRequest,
      headers: { ...baseRequest.headers, 'X-Signature': signature },
    };
    const result = verifier.verify(req);
    expect(result.success).toBe(false);
  });

  it('should handle verification when both templateResolver and body are undefined', () => {
    const verifier = new HmacSignatureVerifier(
      secretKey,
      signatureHeader,
      undefined,
      undefined,
      undefined,
      signatureValueTemplate
    );
    const requestWithoutBody: HttpRequest = {
      ...baseRequest,
      body: undefined,
      headers: { ...baseRequest.headers },
    };

    const signingBytes = Buffer.from('', 'utf8');
    const digest = createHmac(hmacAlgorithm, secretKey)
      .update(signingBytes)
      .digest(encoding);
    const signature = signatureValueTemplate.replace('{digest}', digest);
    if (!requestWithoutBody.headers) {
      requestWithoutBody.headers = {};
    }
    requestWithoutBody.headers['X-Signature'] = signature;
    const result = verifier.verify(requestWithoutBody);
    expect(result.success).toBe(true);
  });
});
