import {
  generateJSONSchema,
  type JSONSchema,
  number,
  optional,
  SchemaMappedType,
  SchemaType,
  strictObject,
  string,
  validateAndMap,
  validateAndUnmap,
} from '../../src';
import { META_SCHEMA } from '../../src/jsonSchemaTypes';

describe('Strict Object', () => {
  describe('toJSONSchema', () => {
    it('should not allow additionalProperties', () => {
      const schema = strictObject({
        foo: ['foo', string()],
      });
      const jsonSchema = generateJSONSchema(schema);
      // additionalProperties should be absent (or false) for strictObject
      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: META_SCHEMA,
        type: 'object',
        properties: {
          foo: { type: 'string' },
        },
        required: ['foo'],
        additionalProperties: false,
      });
    });
  });
  const userSchema = strictObject({
    id: ['user_id', string()],
    age: ['user_age', number()],
  });

  describe('Mapping', () => {
    it('should map valid object', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
      };
      const output = validateAndMap(input, userSchema);
      const expected: SchemaType<typeof userSchema> = {
        id: 'John Smith',
        age: 50,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('should map object with spaces in property names', () => {
      const input = {
        id: 'John Smith',
      };
      const schema = strictObject({ 'user id': ['id', string()] });
      const output = validateAndMap(input, schema);
      const expected: SchemaType<typeof schema> = {
        'user id': 'John Smith',
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('should map object with optional properties', () => {
      const addressSchema = strictObject({
        address1: ['address1', string()],
        address2: ['address2', optional(string())],
      });
      const input = {
        address1: 'first',
      };
      const output = validateAndMap(input, addressSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should fail on non-object value', () => {
      const input = 'not an object';
      const output = validateAndMap(input as any, userSchema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              "not an object",
            ],
            "message": "Expected value to be of type 'StrictObject<{id,age}>' but found 'string'.

        Given value: \\"not an object\\"
        Type: 'string'
        Expected type: 'StrictObject<{id,age}>'",
            "path": Array [],
            "type": "StrictObject<{id,age}>",
            "value": "not an object",
          },
        ]
      `);
    });

    it('should fail on schema property invalidation', () => {
      const input = {
        user_id: 'John Smith',
        user_age: true,
      };
      const output = validateAndMap(input as any, userSchema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "user_age": true,
                "user_id": "John Smith",
              },
              true,
            ],
            "message": "Expected value to be of type 'number' but found 'boolean'.

        Given value: true
        Type: 'boolean'
        Expected type: 'number'
        Path: user_age",
            "path": Array [
              "user_age",
            ],
            "type": "number",
            "value": true,
          },
        ]
      `);
    });

    it('should fail on missing properties', () => {
      const input = {
        user_id: 'John Smith',
      };
      const output = validateAndMap(input as any, userSchema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "user_id": "John Smith",
              },
            ],
            "message": "Some properties are missing in the object: \\"user_age\\".

        Given value: {\\"user_id\\":\\"John Smith\\"}
        Type: 'object'
        Expected type: 'StrictObject<{id,age}>'",
            "path": Array [],
            "type": "StrictObject<{id,age}>",
            "value": Object {
              "user_id": "John Smith",
            },
          },
        ]
      `);
    });

    it('should fail on extra properties', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
        extra: true,
      };
      const output = validateAndMap(input, userSchema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "extra": true,
                "user_age": 50,
                "user_id": "John Smith",
              },
            ],
            "message": "Some unknown properties were found in the object: \\"extra\\".

        Given value: {\\"user_id\\":\\"John Smith\\",\\"user_age\\":50,\\"extra\\":true}
        Type: 'object'
        Expected type: 'StrictObject<{id,age}>'",
            "path": Array [],
            "type": "StrictObject<{id,age}>",
            "value": Object {
              "extra": true,
              "user_age": 50,
              "user_id": "John Smith",
            },
          },
        ]
      `);
    });
  });

  describe('Unmapping', () => {
    it('should map valid object', () => {
      const input = {
        id: 'John Smith',
        age: 50,
      };
      const output = validateAndUnmap(input, userSchema);
      const expected: SchemaMappedType<typeof userSchema> = {
        user_id: 'John Smith',
        user_age: 50,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('should map object with optional properties', () => {
      const addressSchema = strictObject({
        address1: ['address1', string()],
        address2: ['address2', optional(string())],
      });
      const input = {
        address1: 'first',
      };
      const output = validateAndUnmap(input, addressSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should fail on non-object value', () => {
      const input = 'not an object';
      const output = validateAndUnmap(input as any, userSchema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              "not an object",
            ],
            "message": "Expected value to be of type 'StrictObject<{id,age}>' but found 'string'.

        Given value: \\"not an object\\"
        Type: 'string'
        Expected type: 'StrictObject<{id,age}>'",
            "path": Array [],
            "type": "StrictObject<{id,age}>",
            "value": "not an object",
          },
        ]
      `);
    });

    it('should fail on schema property invalidation', () => {
      const input = {
        id: 'John Smith',
        age: true,
      };
      const output = validateAndUnmap(input as any, userSchema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "age": true,
                "id": "John Smith",
              },
              true,
            ],
            "message": "Expected value to be of type 'number' but found 'boolean'.

        Given value: true
        Type: 'boolean'
        Expected type: 'number'
        Path: age",
            "path": Array [
              "age",
            ],
            "type": "number",
            "value": true,
          },
        ]
      `);
    });

    it('should fail on missing properties', () => {
      const input = {
        id: 'John Smith',
      };
      const output = validateAndUnmap(input as any, userSchema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "id": "John Smith",
              },
            ],
            "message": "Some properties are missing in the object: \\"age\\".

        Given value: {\\"id\\":\\"John Smith\\"}
        Type: 'object'
        Expected type: 'StrictObject<{id,age}>'",
            "path": Array [],
            "type": "StrictObject<{id,age}>",
            "value": Object {
              "id": "John Smith",
            },
          },
        ]
      `);
    });

    it('should fail on extra properties', () => {
      const input = {
        id: 'John Smith',
        age: 50,
        extra: true,
      };
      const output = validateAndUnmap(input, userSchema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "age": 50,
                "extra": true,
                "id": "John Smith",
              },
            ],
            "message": "Some unknown properties were found in the object: \\"extra\\".

        Given value: {\\"id\\":\\"John Smith\\",\\"age\\":50,\\"extra\\":true}
        Type: 'object'
        Expected type: 'StrictObject<{id,age}>'",
            "path": Array [],
            "type": "StrictObject<{id,age}>",
            "value": Object {
              "age": 50,
              "extra": true,
              "id": "John Smith",
            },
          },
        ]
      `);
    });
  });
});
