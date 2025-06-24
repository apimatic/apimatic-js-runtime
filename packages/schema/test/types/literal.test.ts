import { generateJSONSchema, type JSONSchema, literal, validateAndMap, validateAndUnmap } from '../../src';

describe('Literal', () => {
  describe('Mapping', () => {
    it('should accept primitive-type literal', () => {
      const input = 123;
      const schema = literal(123);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept object literal', () => {
      const input = {};
      const schema = literal(input);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should failing on invalid values', () => {
      const input = 'hello world';
      const schema = literal(123);
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              "hello world",
            ],
            "message": "Expected value to be of type 'Literal<123>' but found 'string'.

        Given value: \\"hello world\\"
        Type: 'string'
        Expected type: 'Literal<123>'",
            "path": Array [],
            "type": "Literal<123>",
            "value": "hello world",
          },
        ]
      `);
    });
  });
  describe('Unmapping', () => {
    it('should accept primitive-type literal', () => {
      const input = 123;
      const schema = literal(123);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept object literal', () => {
      const input = {};
      const schema = literal(input);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should failing on invalid values', () => {
      const input = 'hello world';
      const schema = literal(123);
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              "hello world",
            ],
            "message": "Expected value to be of type 'Literal<123>' but found 'string'.

        Given value: \\"hello world\\"
        Type: 'string'
        Expected type: 'Literal<123>'",
            "path": Array [],
            "type": "Literal<123>",
            "value": "hello world",
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema', () => {
      const schema = literal(123);
      const jsonSchema = generateJSONSchema(schema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        const: 123,
      });
    });
  });
});
