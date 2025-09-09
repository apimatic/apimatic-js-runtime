import {
  isSignatureVerificationFailure,
  createSignatureVerificationSuccess,
  createSignatureVerificationFailure,
} from '../src/signatureVerificationResult';

describe('signatureVerificationResult', () => {
  describe('createSignatureVerificationSuccess', () => {
    it('should create a success result with correct properties', () => {
      const result = createSignatureVerificationSuccess();
      expect(result.success).toBe(true);
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('createSignatureVerificationFailure', () => {
    it('should create a failure result with correct error message', () => {
      const errorMsg = 'Invalid signature';
      const result = createSignatureVerificationFailure(errorMsg);
      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMsg);
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', errorMsg);
    });
  });

  describe('isSignatureVerificationFailure', () => {
    it('should return true for a SignatureVerificationFailure object', () => {
      const failure = createSignatureVerificationFailure('error');
      expect(isSignatureVerificationFailure(failure)).toBe(true);
    });

    it('should return false for a SignatureVerificationSuccess object', () => {
      const success = createSignatureVerificationSuccess();
      expect(isSignatureVerificationFailure(success)).toBe(false);
    });

    it('should return false for unrelated objects', () => {
      expect(
        isSignatureVerificationFailure({ success: false, error: 'err' })
      ).toBe(false);
      expect(isSignatureVerificationFailure(null)).toBe(false);
      expect(isSignatureVerificationFailure(undefined)).toBe(false);
      expect(isSignatureVerificationFailure('string')).toBe(false);
    });
  });
});
