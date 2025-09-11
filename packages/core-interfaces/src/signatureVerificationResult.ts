const signatureVerificationResultMarker = Symbol('SignatureVerificationResult');

export interface SignatureVerificationResultMarker {
  [signatureVerificationResultMarker]: true;
}

export interface SignatureVerificationSuccess
  extends SignatureVerificationResultMarker {
  success: true;
}

export interface SignatureVerificationFailure
  extends SignatureVerificationResultMarker {
  success: false;
  error: string;
}

export type SignatureVerificationResult =
  | SignatureVerificationSuccess
  | SignatureVerificationFailure;

export function isSignatureVerificationFailure(
  result: unknown
): result is SignatureVerificationFailure {
  return (
    typeof result === 'object' &&
    result !== null &&
    signatureVerificationResultMarker in result &&
    (result as SignatureVerificationFailure).success === false
  );
}

export function createSignatureVerificationSuccess(): SignatureVerificationSuccess {
  return {
    [signatureVerificationResultMarker]: true,
    success: true,
  };
}

export function createSignatureVerificationFailure(
  error: string
): SignatureVerificationFailure {
  return {
    [signatureVerificationResultMarker]: true,
    success: false,
    error,
  };
}
