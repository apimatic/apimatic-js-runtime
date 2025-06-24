import { dict, generateJSONSchema, JSONSchema, string, validateAndMap, validateAndUnmap } from '../../src';

describe('Dictionary', () => {
  describe('Mapping', () => {
    it('should map valid dictionary', () => {
      const input = {
        key1: 'hello',
        key2: 'world',
      };
      const schema = dict(string());
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should fail on other types', () => {
      const input = 123123;
      const schema = dict(string());
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123123,
            ],
            "message": "Expected value to be of type 'Record<string,string>' but found 'number'.

        Given value: 123123
        Type: 'number'
        Expected type: 'Record<string,string>'",
            "path": Array [],
            "type": "Record<string,string>",
            "value": 123123,
          },
        ]
      `);
    });

    it('should fail on item schema invalidation', () => {
      const input = {
        key1: 'hello',
        key2: false,
      };
      const schema = dict(string());
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "key1": "hello",
                "key2": false,
              },
              false,
            ],
            "message": "Expected value to be of type 'string' but found 'boolean'.

        Given value: false
        Type: 'boolean'
        Expected type: 'string'
        Path: key2",
            "path": Array [
              "key2",
            ],
            "type": "string",
            "value": false,
          },
        ]
      `);
    });
  });
  describe('Unmapping', () => {
    it('should map valid dictionary', () => {
      const input = {
        key1: 'hello',
        key2: 'world',
      };
      const schema = dict(string());
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should fail on other types', () => {
      const input = 123123;
      const schema = dict(string());
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              123123,
            ],
            "message": "Expected value to be of type 'Record<string,string>' but found 'number'.

        Given value: 123123
        Type: 'number'
        Expected type: 'Record<string,string>'",
            "path": Array [],
            "type": "Record<string,string>",
            "value": 123123,
          },
        ]
      `);
    });

    it('should fail on item schema invalidation', () => {
      const input = {
        key1: 'hello',
        key2: false,
      };
      const schema = dict(string());
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "key1": "hello",
                "key2": false,
              },
              false,
            ],
            "message": "Expected value to be of type 'string' but found 'boolean'.

        Given value: false
        Type: 'boolean'
        Expected type: 'string'
        Path: key2",
            "path": Array [
              "key2",
            ],
            "type": "string",
            "value": false,
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema for an array', () => {
      const jsonSchema = generateJSONSchema(dict(string()));

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        type: 'object',
        additionalProperties: {
          type: 'string'
        }
      });
    });
  });
});
