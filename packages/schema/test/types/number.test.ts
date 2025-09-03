import {
  generateJSONSchema,
  JSONSchema,
  number,
  validateAndMap,
  validateAndUnmap,
} from '../../src';
import { META_SCHEMA } from '../../src/jsonSchemaTypes';

describe('Number', () => {
  describe('Mapping', () => {
    it('should accept number', () => {
      const input = 123123;
      const schema = number();
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept numeric string', () => {
      const input = '123123';
      const schema = number();
      const output = validateAndMap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(123123);
    });

    it('should fail on other types', () => {
      const input = true;
      const schema = number();
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              true,
            ],
            "message": "Expected value to be of type 'number' but found 'boolean'.

        Given value: true
        Type: 'boolean'
        Expected type: 'number'",
            "path": Array [],
            "type": "number",
            "value": true,
          },
        ]
      `);
    });
  });
  describe('Unmapping', () => {
    it('should accept number', () => {
      const input = 123123;
      const schema = number();
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept numeric string', () => {
      const input = '123123';
      const schema = number();
      const output = validateAndUnmap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(123123);
    });

    it('should fail on other types', () => {
      const input = true;
      const schema = number();
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              true,
            ],
            "message": "Expected value to be of type 'number' but found 'boolean'.

        Given value: true
        Type: 'boolean'
        Expected type: 'number'",
            "path": Array [],
            "type": "number",
            "value": true,
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema', () => {
      const schema = number();
      const jsonSchema = generateJSONSchema(schema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: META_SCHEMA,
        type: 'number',
      });
    });
  });
});
