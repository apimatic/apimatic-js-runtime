import {
  extendExpandoObject,
  extendObject,
  generateJSONSchema,
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

describe('Extend Object/Expando Object', () => {
  const idObject = strictObject({
    id: ['user_id', string()],
  });

  const userSchema = extendExpandoObject(idObject, {
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

    it('should map valid object with additional properties', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
        user_address: 'New York',
      };
      const output = validateAndMap(input, userSchema);
      const expected: SchemaType<typeof userSchema> = {
        id: 'John Smith',
        age: 50,
        user_address: 'New York',
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('should map object with optional properties', () => {
      const addressSchema = extendExpandoObject(
        strictObject({
          address1: ['address1', string()],
        }),
        {
          address2: ['address2', optional(string())],
        }
      );
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
            "message": "Expected value to be of type 'Object<{id,age,...}>' but found 'string'.

        Given value: \\"not an object\\"
        Type: 'string'
        Expected type: 'Object<{id,age,...}>'",
            "path": Array [],
            "type": "Object<{id,age,...}>",
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
        Expected type: 'Object<{id,age,...}>'",
            "path": Array [],
            "type": "Object<{id,age,...}>",
            "value": Object {
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
      const addressSchema = extendExpandoObject(
        strictObject({
          address1: ['address1', string()],
        }),
        {
          address2: ['address2', optional(string())],
        }
      );
      const input = {
        address1: 'first',
      };
      const output = validateAndUnmap(input, addressSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map valid object with additional properties', () => {
      const input = {
        id: 'John Smith',
        age: 50,
        address: 'San Francisco',
      };
      const output = validateAndUnmap(input, userSchema);
      const expected: SchemaMappedType<typeof userSchema> = {
        user_id: 'John Smith',
        user_age: 50,
        address: 'San Francisco',
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
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
            "message": "Expected value to be of type 'Object<{id,age,...}>' but found 'string'.

        Given value: \\"not an object\\"
        Type: 'string'
        Expected type: 'Object<{id,age,...}>'",
            "path": Array [],
            "type": "Object<{id,age,...}>",
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
        Expected type: 'Object<{id,age,...}>'",
            "path": Array [],
            "type": "Object<{id,age,...}>",
            "value": Object {
              "id": "John Smith",
            },
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a JSON Schema with allOf using parent and child schema w/ additionalProperties', () => {
      const userSchema = extendExpandoObject(idObject, {
        age: ['user_age', number()],
      });

      // Act: generate JSON Schema for the extended schema
      const jsonSchema = generateJSONSchema(userSchema);

      // Assert: expect allOf with $ref to parent and inlined child, using $defs
      expect(jsonSchema).toStrictEqual({
        $schema: META_SCHEMA,
        allOf: [
          { $ref: '#/$defs/schema1' },
          {
            type: 'object',
            required: ['user_age'],
            properties: {
              user_age: { type: 'number' },
            },
            additionalProperties: true,
          },
        ],
        $defs: {
          schema1: {
            type: 'object',
            required: ['user_id'],
            properties: {
              user_id: { type: 'string' },
            },
            additionalProperties: false,
          }
        }
      });
    });

    it('should output a JSON Schema with allOf for optional properties w/ additionalProperties', () => {
      const userSchema = extendExpandoObject(idObject, {
        age: ['user_age', optional(number())],
      });
      const jsonSchema = generateJSONSchema(userSchema);

      expect(jsonSchema).toStrictEqual({
        $schema: META_SCHEMA,
        allOf: [
          { $ref: '#/$defs/schema1' },
          {
            type: 'object',
            properties: {
              user_age: { type: 'number' },
            },
            additionalProperties: true,
          },
        ],
        $defs: {
          schema1: {
            type: 'object',
            required: ['user_id'],
            properties: {
              user_id: { type: 'string' },
            },
            additionalProperties: false,
          },
        },
      });
    });

    it('should output a JSON Schema with allOf using parent and child schema w/ additionalProperties', () => {
      const userSchema = extendObject(idObject, {
        age: ['user_age', number()],
      });

      // Act: generate JSON Schema for the extended schema
      const jsonSchema = generateJSONSchema(userSchema);

      // Assert: expect allOf with $ref to parent and inlined child, using $defs
      expect(jsonSchema).toStrictEqual({
        $schema: META_SCHEMA,
        allOf: [
          { $ref: '#/$defs/schema1' },
          {
            type: 'object',
            required: ['user_age'],
            properties: {
              user_age: { type: 'number' },
            },
          },
        ],
        $defs: {
          schema1: {
            type: 'object',
            required: ['user_id'],
            properties: {
              user_id: { type: 'string' },
            },
            additionalProperties: false,
          },
        }
      });
    });
  });
});
