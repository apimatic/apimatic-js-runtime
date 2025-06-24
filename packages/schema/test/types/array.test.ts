import { array, generateJSONSchema, type JSONSchema, string, validateAndMap, validateAndUnmap } from '../../src';

describe('Array', () => {
  describe('Mapping', () => {
    it('should accept valid array', () => {
      const input = ['hello', 'world'];
      const schema = array(string());
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should fail on item schema invalidation', () => {
      const input = ['hello', 123];
      const schema = array(string());
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Array [
                "hello",
                123,
              ],
              123,
            ],
            "message": "Expected value to be of type 'string' but found 'number'.

        Given value: 123
        Type: 'number'
        Expected type: 'string'
        Path: 1",
            "path": Array [
              1,
            ],
            "type": "string",
            "value": 123,
          },
        ]
      `);
    });

    it('should not accept non-array value', () => {
      const input = 123;
      const schema = array(string());
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123,
            ],
            "message": "Expected value to be of type 'Array<string>' but found 'number'.

        Given value: 123
        Type: 'number'
        Expected type: 'Array<string>'",
            "path": Array [],
            "type": "Array<string>",
            "value": 123,
          },
        ]
      `);
    });
  });
  describe('Unmapping', () => {
    it('should accept valid array', () => {
      const input = ['hello', 'world'];
      const schema = array(string());
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should fail on item schema invalidation', () => {
      const input = ['hello', 123];
      const schema = array(string());
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Array [
                "hello",
                123,
              ],
              123,
            ],
            "message": "Expected value to be of type 'string' but found 'number'.

        Given value: 123
        Type: 'number'
        Expected type: 'string'
        Path: 1",
            "path": Array [
              1,
            ],
            "type": "string",
            "value": 123,
          },
        ]
      `);
    });

    it('should not accept non-array value', () => {
      const input = 123;
      const schema = array(string());
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123,
            ],
            "message": "Expected value to be of type 'Array<string>' but found 'number'.

        Given value: 123
        Type: 'number'
        Expected type: 'Array<string>'",
            "path": Array [],
            "type": "Array<string>",
            "value": 123,
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema for an array', () => {
      const jsonSchema = generateJSONSchema(array(string()));

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        type: 'array',
        items: {
          type: 'string'
        }
      });
    });
  });
});
