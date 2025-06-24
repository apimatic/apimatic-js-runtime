import {
  generateJSONSchema,
  JSONSchema,
  string,
  validateAndMap,
  validateAndUnmap,
} from '../../src';

describe('String', () => {
  describe('Mapping', () => {
    it('should accept string', () => {
      const input = 'hello world';
      const schema = string();
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should not accept invalid types', () => {
      const input = 123123;
      const schema = string();
      const output = validateAndMap(input as any, schema);
      expect(output.errors).toBeTruthy();
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123123,
            ],
            "message": "Expected value to be of type 'string' but found 'number'.

        Given value: 123123
        Type: 'number'
        Expected type: 'string'",
            "path": Array [],
            "type": "string",
            "value": 123123,
          },
        ]
      `);
    });
  });

  describe('Unmapping', () => {
    it('should accept string', () => {
      const input = 'hello world';
      const schema = string();
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should not accept invalid types', () => {
      const input = 123123;
      const schema = string();
      const output = validateAndUnmap(input as any, schema);
      expect(output.errors).toBeTruthy();
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123123,
            ],
            "message": "Expected value to be of type 'string' but found 'number'.

        Given value: 123123
        Type: 'number'
        Expected type: 'string'",
            "path": Array [],
            "type": "string",
            "value": 123123,
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema', () => {
      const schema = string();
      const jsonSchema = generateJSONSchema(schema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        type: 'string',
      });
    });
  });
});
