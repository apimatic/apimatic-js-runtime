import { optional, string, validateAndMap, validateAndUnmap } from '../../src';

describe('Optional', () => {
  describe('Mapping', () => {
    it('should accept valid defined value', () => {
      const input = 'hello world';
      const schema = optional(string());
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should accept undefined', () => {
      const schema = optional(string());
      const output = validateAndMap(undefined, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBeUndefined();
    });

    it('should accept null', () => {
      const schema = optional(string());
      const output = validateAndMap(null, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBeUndefined();
    });

    it('should fail on schema invalidation', () => {
      const input = 123;
      const schema = optional(string());
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123,
            ],
            "message": "Expected value to be of type 'Optional<string>' but found 'number'.

        Given value: 123
        Type: 'number'
        Expected type: 'Optional<string>'",
            "path": Array [],
            "type": "Optional<string>",
            "value": 123,
          },
        ]
      `);
    });
  });
  describe('Unmapping', () => {
    it('should accept valid defined value', () => {
      const input = 'hello world';
      const schema = optional(string());
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should accept undefined', () => {
      const schema = optional(string());
      const output = validateAndUnmap(undefined, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBeUndefined();
    });

    it('should fail on schema invalidation', () => {
      const input = 123;
      const schema = optional(string());
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123,
            ],
            "message": "Expected value to be of type 'Optional<string>' but found 'number'.

        Given value: 123
        Type: 'number'
        Expected type: 'Optional<string>'",
            "path": Array [],
            "type": "Optional<string>",
            "value": 123,
          },
        ]
      `);
    });
  });
});
