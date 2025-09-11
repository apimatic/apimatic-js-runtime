import { HttpRequest } from './httpRequest';
import { SignatureVerificationResult } from './signatureVerificationResult';

export interface SignatureVerifier {
  verify(req: HttpRequest): SignatureVerificationResult;
}
