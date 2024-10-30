import {
  number,
  expandoObject,
  optional,
  SchemaMappedType,
  SchemaType,
  string,
  validateAndMap,
  validateAndUnmap,
  typedExpandoObject,
  dict,
  object,
  anyOf,
} from '../../src';

describe('Expando Object', () => {
  const userSchema = expandoObject({
    id: ['user_id', string()],
    age: ['user_age', number()],
  });

  const userSchemaWithAdditionalNumbers = typedExpandoObject(
    {
      id: ['user_id', string()],
      age: ['user_age', number()],
    },
    ['additionalProps', optional(dict(number()))]
  );

  const workSchema = object({
    size: ['size', number()],
    name: ['Name', string()],
  });

  const userSchemaWithAdditionalWorks = typedExpandoObject(
    {
      id: ['user_id', string()],
      age: ['user_age', number()],
    },
    ['additionalProps', optional(dict(workSchema))]
  );

  const userSchemaWithAdditionalAnyOf = typedExpandoObject(
    {
      id: ['user_id', string()],
      age: ['user_age', number()],
    },
    ['additionalProps', optional(dict(anyOf([workSchema, number()])))]
  );

  describe('Mapping', () => {
    it('AdditionalProperties: should map with additional properties', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
        number1: 123,
        number2: 123.2,
        invalid: 'string value',
      };
      const output = validateAndMap(input, userSchemaWithAdditionalNumbers);
      const expected: SchemaType<typeof userSchemaWithAdditionalNumbers> = {
        id: 'John Smith',
        age: 50,
        additionalProps: {
          number1: 123,
          number2: 123.2,
        },
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('AdditionalProperties: should map with only invalid additional properties', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
        invalid: 'string value',
      };
      const output = validateAndMap(input, userSchemaWithAdditionalNumbers);
      const expected: SchemaType<typeof userSchemaWithAdditionalNumbers> = {
        id: 'John Smith',
        age: 50,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('AdditionalProperties: should map without additional properties', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
      };
      const output = validateAndMap(input, userSchemaWithAdditionalNumbers);
      const expected: SchemaType<typeof userSchemaWithAdditionalNumbers> = {
        id: 'John Smith',
        age: 50,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('AdditionalProperties: should map with object typed additional properties', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
        obj: {
          size: 123,
          Name: 'WorkA',
        },
        invalid1: 123.2,
        invalid2: {
          size: '123 A',
          Name: 'WorkA',
        },
      };
      const output = validateAndMap(input, userSchemaWithAdditionalWorks);
      const expected: SchemaType<typeof userSchemaWithAdditionalWorks> = {
        id: 'John Smith',
        age: 50,
        additionalProps: {
          obj: {
            size: 123,
            name: 'WorkA',
          },
        },
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('AdditionalProperties: should map with anyOf typed additional properties', () => {
      const input = {
        user_id: 'John Smith',
        user_age: 50,
        obj: {
          size: 123,
          Name: 'WorkA',
        },
        number: 123.2,
        invalid2: {
          size: '123 A',
          Name: 'WorkA',
        },
      };
      const output = validateAndMap(input, userSchemaWithAdditionalAnyOf);
      const expected: SchemaType<typeof userSchemaWithAdditionalAnyOf> = {
        id: 'John Smith',
        age: 50,
        additionalProps: {
          obj: {
            size: 123,
            name: 'WorkA',
          },
          number: 123.2,
        },
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
      const addressSchema = expandoObject({
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
        user_address: 'New York',
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
    it('AdditionalProperties: should unmap with additional properties', () => {
      const input = {
        id: 'John Smith',
        age: 50, // takes precedence over additionalProps[user_age]
        additionalProps: {
          number1: 123,
          number2: 123.2,
        },
      };
      const output = validateAndUnmap(input, userSchemaWithAdditionalNumbers);
      const expected = {
        user_id: 'John Smith',
        user_age: 50,
        number1: 123,
        number2: 123.2,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('AdditionalProperties: should unmap without additional properties', () => {
      const input = {
        id: 'John Smith',
        age: 50,
      };
      const output = validateAndUnmap(input, userSchemaWithAdditionalNumbers);
      const expected = {
        user_id: 'John Smith',
        user_age: 50,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('AdditionalProperties: should unmap with object typed additional properties', () => {
      const input = {
        id: 'John Smith',
        age: 50,
        additionalProps: {
          obj: {
            size: 123,
            name: 'WorkA',
          },
        },
      };
      const output = validateAndUnmap(input, userSchemaWithAdditionalWorks);
      const expected = {
        user_id: 'John Smith',
        user_age: 50,
        obj: {
          size: 123,
          Name: 'WorkA',
        },
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('AdditionalProperties: should unmap with anyOf typed additional properties', () => {
      const input = {
        id: 'John Smith',
        age: 50,
        additionalProps: {
          obj: {
            size: 123,
            name: 'WorkA',
          },
          number: 123.2,
        },
      };
      const output = validateAndUnmap(input, userSchemaWithAdditionalAnyOf);
      const expected = {
        user_id: 'John Smith',
        user_age: 50,
        obj: {
          size: 123,
          Name: 'WorkA',
        },
        number: 123.2,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('AdditionalProperties: should unmap with empty or blank additional property keys', () => {
      const input = {
        id: 'John Smith',
        age: 50,
        additionalProps: {
          '  ': 123.2,
          '': 52,
        },
      };
      const output = validateAndUnmap(input, userSchemaWithAdditionalNumbers);
      const expected = {
        user_id: 'John Smith',
        user_age: 50,
        '  ': 123.2,
        '': 52,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('should unmap valid object', () => {
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

    it('should unmap object with optional properties', () => {
      const addressSchema = expandoObject({
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

    it('should unmap valid object with additional properties', () => {
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

    it('AdditionalProperties: should fail with conflicting additional properties', () => {
      const input = {
        id: 'John Smith',
        age: 50,
        additionalProps: {
          number1: 123,
          number2: 123.2,
          user_age: 52,
        },
      };
      const output = validateAndUnmap(input, userSchemaWithAdditionalNumbers);
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "additionalProps": Object {
                  "number1": 123,
                  "number2": 123.2,
                  "user_age": 52,
                },
                "age": 50,
                "id": "John Smith",
              },
            ],
            "message": "An additional property key, 'user_age' conflicts with one of the model's properties.

        Given value: {\\"id\\":\\"John Smith\\",\\"age\\":50,\\"additionalProps\\":{\\"number1\\":123,\\"number2\\":123.2,\\"user_age\\":52}}
        Type: 'object'
        Expected type: 'Object<{id,age,...}>'",
            "path": Array [],
            "type": "Object<{id,age,...}>",
            "value": Object {
              "additionalProps": Object {
                "number1": 123,
                "number2": 123.2,
                "user_age": 52,
              },
              "age": 50,
              "id": "John Smith",
            },
          },
        ]
      `);
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
});
