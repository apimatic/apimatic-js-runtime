import {
  generateJSONSchema,
  lazy,
  nullable,
  number,
  object,
  optional,
  JSONSchema,
  SchemaMappedType,
  SchemaType,
  string,
  validateAndMap,
  validateAndUnmap,
} from '../../src';

describe('Object', () => {
  describe('Mapping', () => {
    const userSchema = object({
      id: ['user_id', string()],
      age: ['user_age', number()],
      work: ['user_work', optional(nullable(lazy(() => workSchema)))],
    });

    const workSchema = object({
      id: ['work_id', optional(nullable(number()))],
      name: ['work_name', optional(nullable(string()))],
      address: ['work_address', optional(nullable(string()))],
    });

    it('should map valid object with lazy loaded sub object', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
        user_work: {
          work_id: null,
          work_name: undefined,
        },
      };
      const output = validateAndMap(input, userSchema);
      const expected: SchemaType<typeof userSchema> = {
        id: 'John Smith',
        age: 50,
        work: {
          id: null,
        },
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('should map valid object with missing lazy loaded sub object', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
        user_work: undefined,
      };
      const output = validateAndMap(input, userSchema);
      const expected: SchemaType<typeof userSchema> = {
        id: 'John Smith',
        age: 50,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('should map valid object with null lazy loaded sub object', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
        user_work: null,
      };
      const output = validateAndMap(input, userSchema);
      const expected: SchemaType<typeof userSchema> = {
        id: 'John Smith',
        age: 50,
        work: null,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

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

    it('should map object with optional properties', () => {
      const addressSchema = object({
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
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
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
            "message": "Expected value to be of type 'Object<{id,age,work}>' but found 'string'.

        Given value: \\"not an object\\"
        Type: 'string'
        Expected type: 'Object<{id,age,work}>'",
            "path": Array [],
            "type": "Object<{id,age,work}>",
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
        Expected type: 'Object<{id,age,work}>'",
            "path": Array [],
            "type": "Object<{id,age,work}>",
            "value": Object {
              "user_id": "John Smith",
            },
          },
        ]
      `);
    });
  });
  describe('Unmapping', () => {
    const userSchema = object({
      id: ['user_id', string()],
      age: ['user_age', number()],
    });

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
      const addressSchema = object({
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
            "message": "Expected value to be of type 'Object<{id,age}>' but found 'string'.

        Given value: \\"not an object\\"
        Type: 'string'
        Expected type: 'Object<{id,age}>'",
            "path": Array [],
            "type": "Object<{id,age}>",
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
        Expected type: 'Object<{id,age}>'",
            "path": Array [],
            "type": "Object<{id,age}>",
            "value": Object {
              "id": "John Smith",
            },
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema for an object with required properties', () => {
      const userSchema = object({
        id: ['id', string()],
        age: ['age', number()],
      });
      const jsonSchema = generateJSONSchema(userSchema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        type: 'object',
        required: ['id', 'age'],
        properties: {
          id: {
            type: 'string',
          },
          age: {
            type: 'number',
          },
        },
      });
    });

    it('should output a valid JSON Schema for an object with required and optional properties', () => {
      const userSchema = object({
        id: ['id', string()],
        age: ['age', optional(number())],
      });
      const jsonSchema = generateJSONSchema(userSchema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
          },
          age: {
            type: 'number',
          },
        },
      });
    });

    it('should output a valid JSON Schema for an object with required nullable property', () => {
      const userSchema = object({
        id: ['id', nullable(string())],
      });
      const jsonSchema = generateJSONSchema(userSchema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            oneOf: [
              {
                type: 'null',
              },
              {
                type: 'string',
              },
            ],
          },
        },
      });
    });

    it('should output a valid JSON Schema for an object with optional nullable property', () => {
      const userSchema = object({
        id: ['id', optional(nullable(string()))],
      });
      const jsonSchema = generateJSONSchema(userSchema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        type: 'object',
        properties: {
          id: {
            oneOf: [
              {
                type: 'null',
              },
              {
                type: 'string',
              },
            ],
          },
        },
      });
    });
  });
});
