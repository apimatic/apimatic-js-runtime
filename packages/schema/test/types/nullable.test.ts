import {
  boolean,
  nullable,
  optional,
  string,
  validateAndMap,
  validateAndUnmap,
} from '../../src';

describe('Nullable', () => {
  describe('Mapping', () => {
    it('should accept valid defined value', () => {
      const input = 'hello world';
      const schema = nullable(string());
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should accept null', () => {
      const schema = nullable(string());
      const output = validateAndMap(null, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBeNull();
    });

    it('should accept undefined as null', () => {
      const schema = nullable(string());
      const output = validateAndMap(undefined, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBeNull();
    });

    it('should accept null with nullable and optional', () => {
      const schema = nullable(optional(string()));
      const output = validateAndMap(null, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBeNull();
    });

    it('should accept undefined with nullable and optional', () => {
      const schema = nullable(optional(string()));
      const output = validateAndMap(undefined, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBeUndefined();
    });

    it('should fail on schema invalidation', () => {
      const input = 123;
      const schema = nullable(string());
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123,
            ],
            "message": "Expected value to be of type 'Nullable<string>' but found 'number'.

        Given value: 123
        Type: 'number'
        Expected type: 'Nullable<string>'",
            "path": Array [],
            "type": "Nullable<string>",
            "value": 123,
          },
        ]
      `);
    });
  });
  describe('Unmapping', () => {
    it('should accept valid defined value', () => {
      const input = 'hello world';
      const schema = nullable(string());
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should accept null', () => {
      const schema = nullable(string());
      const output = validateAndUnmap(null, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBeNull();
    });

    it('should fail on schema invalidation', () => {
      const input = 123;
      const schema = nullable(string());
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123,
            ],
            "message": "Expected value to be of type 'Nullable<string>' but found 'number'.

        Given value: 123
        Type: 'number'
        Expected type: 'Nullable<string>'",
            "path": Array [],
            "type": "Nullable<string>",
            "value": 123,
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
      it('should output a valid JSON Schema for nullable strings', () => {
        const schema = nullable(string());
        const jsonSchema = schema.toJSONSchema();

        expect(jsonSchema).toStrictEqual(
          {
            oneOf: [
              {
                type: 'null'
              },
              {
                type: 'string'
              }
            ],
          }
        );
      });

      it('should output a valid JSON Schema for nullable booleans', () => {
        const schema = nullable(boolean());
        const jsonSchema = schema.toJSONSchema();

        expect(jsonSchema).toStrictEqual(
          {
            oneOf: [
              {
                type: 'null'
              },
              {
                type: 'boolean'
              }
            ],
          }
        );
      });
    });
});
