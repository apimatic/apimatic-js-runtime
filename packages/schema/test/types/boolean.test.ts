import { boolean, generateJSONSchema, type JSONSchema, validateAndMap, validateAndUnmap } from '../../src';

describe('Boolean', () => {
  describe('Mapping', () => {
    it('should accept boolean true', () => {
      const input = true;
      const schema = boolean();
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept boolean false', () => {
      const input = false;
      const schema = boolean();
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept string "true"', () => {
      const input = 'true';
      const schema = boolean();
      const output = validateAndMap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(true);
    });

    it('should accept string "false"', () => {
      const input = 'false';
      const schema = boolean();
      const output = validateAndMap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(false);
    });

    it('should fail on other types', () => {
      const input = 123123;
      const schema = boolean();
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123123,
            ],
            "message": "Expected value to be of type 'boolean' but found 'number'.

        Given value: 123123
        Type: 'number'
        Expected type: 'boolean'",
            "path": Array [],
            "type": "boolean",
            "value": 123123,
          },
        ]
      `);
    });
  });
  describe('Unmapping', () => {
    it('should accept boolean true', () => {
      const input = true;
      const schema = boolean();
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept boolean false', () => {
      const input = false;
      const schema = boolean();
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should fail on other types', () => {
      const input = 'hello world';
      const schema = boolean();
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              "hello world",
            ],
            "message": "Expected value to be of type 'boolean' but found 'string'.

        Given value: \\"hello world\\"
        Type: 'string'
        Expected type: 'boolean'",
            "path": Array [],
            "type": "boolean",
            "value": "hello world",
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema', () => {
      const schema = boolean();
      const jsonSchema = generateJSONSchema(schema);

      expect(jsonSchema).toStrictEqual<JSONSchema>(
        {
          $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
          type: 'boolean',
        }
      );
    });
  });
});
