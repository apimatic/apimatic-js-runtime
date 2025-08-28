import {
  extendTypedExpandoObject,
  strictObject,
  string,
  number,
  validateAndMap,
  validateAndUnmap,
  generateJSONSchema,
} from '../../src';
import { META_SCHEMA } from '../../src/jsonSchemaTypes';

describe('extendTypedExpandoObject', () => {
  const baseSchema = strictObject({
    id: ['user_id', string()],
  });

  const extendedSchema = extendTypedExpandoObject(
    baseSchema as any,
    'extra',
    string(),
    {
      age: ['user_age', number()],
    }
  );


  describe('Mapping', () => {
    it('should map valid object with additional typed properties', () => {
      const input = {
        user_id: 'John',
        user_age: 30,
        foo: 'bar',
        bar: 'baz',
      };
  const output = validateAndMap(input as any, extendedSchema);
      const expected = {
        id: 'John',
        age: 30,
        extra: { foo: 'bar', bar: 'baz' },
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('should map valid object without additional typed properties', () => {
      const input = {
        user_id: 'John',
        user_age: 30,
      };
  const output = validateAndMap(input as any, extendedSchema);
      const expected = {
        id: 'John',
        age: 30,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('should omit invalid additional property type', () => {
      const input = {
        user_id: 'John',
        user_age: 30,
        foo: 123, // not a string
      };
      const output = validateAndMap(input as any, extendedSchema);
      // The invalid property should be omitted from extra, and no errors are reported
      expect((output as any).result).toEqual({
        id: 'John',
        age: 30,
      });
      expect(output.errors).toBeFalsy();
    });
  });

  describe('Unmapping', () => {
    it('should unmap valid object with additional typed properties', () => {
      const input = {
        id: 'John',
        age: 30,
        extra: { foo: 'bar', bar: 'baz' },
      };
  const output = validateAndUnmap(input as any, extendedSchema);
      const expected = {
        user_id: 'John',
        user_age: 30,
        foo: 'bar',
        bar: 'baz',
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });

    it('should unmap valid object without additional typed properties', () => {
      const input = {
        id: 'John',
        age: 30,
      };
  const output = validateAndUnmap(input as any, extendedSchema);
      const expected = {
        user_id: 'John',
        user_age: 30,
      };
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(expected);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a JSON Schema with allOf using parent and child schema w/ additionalProperties', () => {
      const jsonSchema = generateJSONSchema(extendedSchema);
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
            additionalProperties: {
                type: 'string',
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
        },
      });
    });
  });
});
