import { validate, string, nullable, optional, object, number } from '../src';

describe('validate function', () => {
  describe('String schema', () => {
    it('should return true for valid string', () => {
      expect(validate('hello', string())).toBe(true);
    });
    it('should return false for invalid type', () => {
      expect(validate(123, string())).toBe(false);
      expect(validate({}, string())).toBe(false);
      expect(validate([], string())).toBe(false);
    });
  });

  describe('Nullable schema', () => {
    it('should return true for null', () => {
      expect(validate(null, nullable(string()))).toBe(true);
    });
    it('should return true for valid string', () => {
      expect(validate('hello', nullable(string()))).toBe(true);
    });
    it('should return false for invalid type', () => {
      expect(validate(123, nullable(string()))).toBe(false);
    });
    it('should return true for undefined', () => {
      expect(validate(undefined, nullable(string()))).toBe(false);
    });
  });

  describe('Optional schema', () => {
    it('should return true for undefined', () => {
      expect(validate(undefined, optional(string()))).toBe(true);
    });
    it('should return true for valid string', () => {
      expect(validate('hello', optional(string()))).toBe(true);
    });
    it('should return true for null', () => {
      expect(validate(null, optional(string()))).toBe(false);
    });
    it('should return false for invalid type', () => {
      expect(validate(123, optional(string()))).toBe(false);
    });
  });

  describe('Optional + Nullable schema', () => {
    it('should return true for null', () => {
      expect(validate(null, optional(nullable(string())))).toBe(true);
    });
    it('should return true for undefined', () => {
      expect(validate(undefined, optional(nullable(string())))).toBe(true);
    });
    it('should return true for valid string', () => {
      expect(validate('hello', optional(nullable(string())))).toBe(true);
    });
    it('should return false for invalid type', () => {
      expect(validate(123, optional(nullable(string())))).toBe(false);
    });
  });

  describe('Nullable + Optional schema', () => {
    it('should return true for null', () => {
      expect(validate(null, nullable(optional(string())))).toBe(true);
    });
    it('should return true for undefined', () => {
      expect(validate(undefined, nullable(optional(string())))).toBe(true);
    });
    it('should return true for valid string', () => {
      expect(validate('hello', nullable(optional(string())))).toBe(true);
    });
    it('should return false for invalid type', () => {
      expect(validate(123, nullable(optional(string())))).toBe(false);
    });
  });

  describe('Corner cases', () => {
    it('should return false for empty object', () => {
      expect(validate({}, string())).toBe(false);
    });
    it('should return false for array', () => {
      expect(validate([], string())).toBe(false);
    });
    it('should return false for boolean', () => {
      expect(validate(true, string())).toBe(false);
      expect(validate(false, string())).toBe(false);
    });
  });

  describe('Object schema with mixed fields', () => {
    const userSchema = object({
      name: ['name', string()],
      nickname: ['nickname', optional(string())],
      age: ['age', number()],
      address: [
        'address',
        object({
          city: ['city', string()],
          zip: ['zip', number()],
        }),
      ],
    });
    it('should return true for valid object', () => {
      const obj = {
        name: 'John',
        nickname: 'Johnny',
        age: 30,
        address: { city: 'NY', zip: 10001 },
      };
      expect(validate(obj, userSchema)).toBe(true);
    });
    it('should return true for valid object with missing optional fields', () => {
      const obj = {
        name: 'John',
        age: 30,
        address: { city: 'NY', zip: 10001 },
      };
      expect(validate(obj, userSchema)).toBe(true);
    });
    it('should return false for missing required field', () => {
      const obj = {
        nickname: 'Johnny',
        age: 30,
        address: { city: 'NY', zip: 10001 },
      };
      expect(validate(obj, userSchema)).toBe(false);
    });
    it('should return false for wrong type in nickname', () => {
      const obj = {
        name: 'John',
        nickname: 123,
        age: 30,
        address: { city: 'NY', zip: 10001 },
      };
      expect(validate(obj, userSchema)).toBe(false);
    });
  });
});
