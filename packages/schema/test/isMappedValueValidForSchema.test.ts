import {
  isMappedValueValidForSchema,
  string,
  nullable,
  optional,
  object,
  number,
  Schema,
} from '../src';
import { oneOf } from '../src/types/oneOf';

describe('isMappedValueValidForSchema function', () => {
  describe('String schema', () => {
    it('should return true for valid string', () => {
      expect(isMappedValueValidForSchema('hello', string())).toBe(true);
    });
    it('should return false for invalid type', () => {
      expect(isMappedValueValidForSchema(123, string())).toBe(false);
      expect(isMappedValueValidForSchema({}, string())).toBe(false);
      expect(isMappedValueValidForSchema([], string())).toBe(false);
    });
  });

  describe('Nullable schema', () => {
    it('should return true for null', () => {
      expect(isMappedValueValidForSchema(null, nullable(string()))).toBe(true);
    });
    it('should return true for valid string', () => {
      expect(isMappedValueValidForSchema('hello', nullable(string()))).toBe(
        true
      );
    });
    it('should return false for invalid type', () => {
      expect(isMappedValueValidForSchema(123, nullable(string()))).toBe(false);
    });
    it('should return true for undefined', () => {
      expect(isMappedValueValidForSchema(undefined, nullable(string()))).toBe(
        false
      );
    });
  });

  describe('Optional schema', () => {
    it('should return true for undefined', () => {
      expect(isMappedValueValidForSchema(undefined, optional(string()))).toBe(
        true
      );
    });
    it('should return true for valid string', () => {
      expect(isMappedValueValidForSchema('hello', optional(string()))).toBe(
        true
      );
    });
    it('should return true for null', () => {
      expect(isMappedValueValidForSchema(null, optional(string()))).toBe(false);
    });
    it('should return false for invalid type', () => {
      expect(isMappedValueValidForSchema(123, optional(string()))).toBe(false);
    });
  });

  describe('Optional + Nullable schema', () => {
    it('should return true for null', () => {
      expect(
        isMappedValueValidForSchema(null, optional(nullable(string())))
      ).toBe(true);
    });
    it('should return true for undefined', () => {
      expect(
        isMappedValueValidForSchema(undefined, optional(nullable(string())))
      ).toBe(true);
    });
    it('should return true for valid string', () => {
      expect(
        isMappedValueValidForSchema('hello', optional(nullable(string())))
      ).toBe(true);
    });
    it('should return false for invalid type', () => {
      expect(
        isMappedValueValidForSchema(123, optional(nullable(string())))
      ).toBe(false);
    });
  });

  describe('Nullable + Optional schema', () => {
    it('should return true for null', () => {
      expect(
        isMappedValueValidForSchema(null, nullable(optional(string())))
      ).toBe(true);
    });
    it('should return true for undefined', () => {
      expect(
        isMappedValueValidForSchema(undefined, nullable(optional(string())))
      ).toBe(true);
    });
    it('should return true for valid string', () => {
      expect(
        isMappedValueValidForSchema('hello', nullable(optional(string())))
      ).toBe(true);
    });
    it('should return false for invalid type', () => {
      expect(
        isMappedValueValidForSchema(123, nullable(optional(string())))
      ).toBe(false);
    });
  });

  describe('Corner cases', () => {
    it('should return false for empty object', () => {
      expect(isMappedValueValidForSchema({}, string())).toBe(false);
    });
    it('should return false for array', () => {
      expect(isMappedValueValidForSchema([], string())).toBe(false);
    });
    it('should return false for boolean', () => {
      expect(isMappedValueValidForSchema(true, string())).toBe(false);
      expect(isMappedValueValidForSchema(false, string())).toBe(false);
    });
  });

  describe('Object schema with mixed fields', () => {
    const userSchema = object({
      name: ['name', string()],
      nickname: ['nick_name', optional(string())],
      age: ['age', number()],
      address: [
        'address',
        object({
          city: ['city name', string()],
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
      expect(isMappedValueValidForSchema(obj, userSchema)).toBe(true);
    });
    it('should return true for valid object with missing optional fields', () => {
      const obj = {
        name: 'John',
        age: 30,
        address: { city: 'NY', zip: 10001 },
      };
      expect(isMappedValueValidForSchema(obj, userSchema)).toBe(true);
    });
    it('should return false for missing required field', () => {
      const obj = {
        nickname: 'Johnny',
        age: 30,
        address: { city: 'NY', zip: 10001 },
      };
      expect(isMappedValueValidForSchema(obj, userSchema)).toBe(false);
    });
    it('should return false for wrong type in nickname', () => {
      const obj = {
        name: 'John',
        nickname: 123,
        age: 30,
        address: { city: 'NY', zip: 10001 },
      };
      expect(isMappedValueValidForSchema(obj, userSchema)).toBe(false);
    });
  });

  describe('OneOf schema validation with discriminator', () => {
    interface Employee {
      role: string;
      id: number;
      address: string;
    }

    interface Boss {
      role: string;
      id: number;
      address: string;
    }

    type OneOfEmployeeBoss = Employee | Boss;

    const employeeSchema: Schema<Employee> = object({
      role: ['role', string()],
      id: ['id', number()],
      address: ['address', string()],
    });

    const bossSchema: Schema<Boss> = object({
      role: ['role', string()],
      id: ['id', number()],
      address: ['address', string()],
    });

    const discriminatorMap = {
      employee: employeeSchema,
      boss: bossSchema,
    };

    const oneOfEmployeeBossSchema: Schema<OneOfEmployeeBoss> = oneOf(
      [employeeSchema, bossSchema],
      discriminatorMap,
      'role'
    );

    describe('OneOfEmployeeBoss schema validation', () => {
      it('should return true for valid employee', () => {
        const obj = {
          role: 'employee',
          id: 1,
          address: '123 Main St',
        };
        expect(isMappedValueValidForSchema(obj, oneOfEmployeeBossSchema)).toBe(
          true
        );
      });

      it('should return true for valid boss', () => {
        const obj = {
          role: 'boss',
          id: 2,
          address: '456 Elm St',
        };
        expect(isMappedValueValidForSchema(obj, oneOfEmployeeBossSchema)).toBe(
          true
        );
      });

      it('should return false for invalid role', () => {
        const obj = {
          role: 'intern',
          id: 3,
          address: '789 Oak St',
        };
        expect(isMappedValueValidForSchema(obj, oneOfEmployeeBossSchema)).toBe(
          false
        );
      });
    });
  });
});
