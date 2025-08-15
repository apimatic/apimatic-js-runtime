import {
  defaults,
  generateJSONSchema,
  JSONSchema,
  nullable,
  optional,
  string,
  validateAndMap,
  validateAndUnmap,
} from '../../src';

describe('Defaults', () => {
  describe('Mapping', () => {
    it('should map using nested schema', () => {
      const input = 'hello world';
      const schema = defaults(string(), 'default value');
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should map to default value on null', () => {
      const schema = defaults(nullable(string()), 'default value');
      const output = validateAndMap(null, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe('default value');
    });

    it('should map to default value on undefined', () => {
      const schema = defaults(optional(string()), 'default value');
      const output = validateAndMap(undefined, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe('default value');
    });

    it('should fail on schema invalidation', () => {
      const input = 123123;
      const schema = defaults(string(), 'default value');
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123123,
            ],
            "message": "Expected value to be of type 'Defaults<string,\\"default value\\">' but found 'number'.

        Given value: 123123
        Type: 'number'
        Expected type: 'Defaults<string,\\"default value\\">'",
            "path": Array [],
            "type": "Defaults<string,\\"default value\\">",
            "value": 123123,
          },
        ]
      `);
    });
  });

  describe('Unmapping', () => {
    it('should map using nested schema', () => {
      const input = 'hello world';
      const schema = defaults(string(), 'default value');
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should map to default value on null', () => {
      const schema = defaults(nullable(string()), 'default value');
      const output = validateAndUnmap(null, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe('default value');
    });

    it('should map to default value on undefined', () => {
      const schema = defaults(optional(string()), 'default value');
      const output = validateAndUnmap(undefined, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe('default value');
    });

    it('should fail on schema invalidation', () => {
      const input = 123123;
      const schema = defaults(string(), 'default value');
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123123,
            ],
            "message": "Expected value to be of type 'Defaults<string,\\"default value\\">' but found 'number'.

        Given value: 123123
        Type: 'number'
        Expected type: 'Defaults<string,\\"default value\\">'",
            "path": Array [],
            "type": "Defaults<string,\\"default value\\">",
            "value": 123123,
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema', () => {
      const schema = defaults(string(), 'default value');
      const jsonSchema = generateJSONSchema(schema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        type: 'string',
        default: 'default value',
      });
    });
  });
});
