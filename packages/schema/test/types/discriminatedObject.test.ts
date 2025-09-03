import {
  boolean,
  discriminatedObject,
  extendStrictObject,
  generateJSONSchema,
  nullable,
  number,
  optional,
  strictObject,
  string,
  validateAndMap,
  validateAndUnmap,
  JSONSchema,
  object,
} from '../../src';
import { META_SCHEMA } from '../../src/jsonSchemaTypes';

describe('Discriminated Object', () => {
  const baseType = strictObject({
    type: ['type unmapped', optional(string())],
    baseField: ['base field', number()],
  });

  const childType1 = extendStrictObject(baseType, {
    type: ['type unmapped', optional(string())],
    child1Field: ['child1 field', boolean()],
  });

  const childType2 = extendStrictObject(baseType, {
    type: ['type unmapped', optional(string())],
    child2Field: ['child2 field', boolean()],
  });

  const discriminatedSchema = discriminatedObject(
    'type',
    'type unmapped',
    {
      base: baseType,
      child1: childType1,
      child2: childType2,
    },
    'base'
  );

  const nestedDiscriminatedObject = strictObject({
    innerType: ['inner type', nullable(discriminatedSchema)],
  });

  describe('Mapping', () => {
    it('should map to child type on discriminator match', () => {
      const input = {
        'type unmapped': 'child1',
        'base field': 123123,
        'child1 field': true,
      };
      const output = validateAndMap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        type: 'child1',
        baseField: 123123,
        child1Field: true,
      });
    });

    it('should map to child type without discriminator match', () => {
      const input = {
        'type unmapped': 'hello world',
        'base field': 123123,
        'child1 field': true,
      };
      const output = validateAndMap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        type: 'hello world',
        baseField: 123123,
        child1Field: true,
      });
    });

    it('should map to child type with missing discriminator', () => {
      const input = {
        'base field': 123123,
        'child1 field': true,
      };
      const output = validateAndMap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        baseField: 123123,
        child1Field: true,
      });
    });

    it('should map to base type on discriminator match', () => {
      const input = {
        'type unmapped': 'base',
        'base field': 123123,
      };
      const output = validateAndMap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        type: 'base',
        baseField: 123123,
      });
    });

    it('should map to base type without discriminator match', () => {
      const input = {
        'type unmapped': 'hello world',
        'base field': 123123,
      };
      const output = validateAndMap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        type: 'hello world',
        baseField: 123123,
      });
    });

    it('should fail on schema invalidation', () => {
      const input = {
        'type unmapped': 'child1',
        'base field': 123123,
        'child1 field': 101,
      };
      const output = validateAndMap(input, discriminatedSchema);
      expect(output.errors).toBeTruthy();
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "base field": 123123,
                "child1 field": 101,
                "type unmapped": "child1",
              },
              101,
            ],
            "message": "Expected value to be of type 'boolean' but found 'number'.

        Given value: 101
        Type: 'number'
        Expected type: 'boolean'
        Path: \\"child1 field\\"",
            "path": Array [
              "child1 field",
            ],
            "type": "boolean",
            "value": 101,
          },
        ]
      `);
    });

    it('should map to nestedDiscriminatedObject with null', () => {
      const input = {};
      const output = validateAndMap(input, nestedDiscriminatedObject);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        innerType: null,
      });
    });
  });
  describe('Unmapping', () => {
    it('should unmap child type on discriminator match', () => {
      const input = {
        type: 'child1',
        baseField: 123123,
        child1Field: true,
      };
      const output = validateAndUnmap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        'type unmapped': 'child1',
        'base field': 123123,
        'child1 field': true,
      });
    });

    it('should unmap child type without discriminator match', () => {
      const input = {
        type: 'hello world',
        baseField: 123123,
        child1Field: true,
      };
      const output = validateAndUnmap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        'type unmapped': 'hello world',
        'base field': 123123,
        'child1 field': true,
      });
    });

    it('should unmap child type with missing discriminator', () => {
      const input = {
        baseField: 123123,
        child1Field: true,
      };
      const output = validateAndUnmap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        'base field': 123123,
        'child1 field': true,
      });
    });

    it('should unmap base type on discriminator match', () => {
      const input = {
        type: 'base',
        baseField: 123123,
      };
      const output = validateAndUnmap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        'type unmapped': 'base',
        'base field': 123123,
      });
    });

    it('should unmap base type without discriminator match', () => {
      const input = {
        type: 'hello world',
        baseField: 123123,
      };
      const output = validateAndUnmap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        'type unmapped': 'hello world',
        'base field': 123123,
      });
    });

    it('should unmap base type with missing discriminator', () => {
      const input = {
        baseField: 123123,
      };
      const output = validateAndUnmap(input, discriminatedSchema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual({
        'base field': 123123,
      });
    });

    it('should fail on schema invalidation', () => {
      const input = {
        type: 'child1',
        baseField: 123123,
        child1Field: 101,
      };
      const output = validateAndUnmap(input, discriminatedSchema);
      expect(output.errors).toBeTruthy();
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "baseField": 123123,
                "child1Field": 101,
                "type": "child1",
              },
              101,
            ],
            "message": "Expected value to be of type 'boolean' but found 'number'.

        Given value: 101
        Type: 'number'
        Expected type: 'boolean'
        Path: child1Field",
            "path": Array [
              "child1Field",
            ],
            "type": "boolean",
            "value": 101,
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema as anyOf with discriminator for inheritance using extended schemas', () => {
      const jsonSchema = generateJSONSchema(discriminatedSchema);
      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: META_SCHEMA,
        anyOf: [
          { $ref: '#/$defs/schema1' },
          { $ref: '#/$defs/schema2' },
          { $ref: '#/$defs/schema3' },
        ],
        discriminator: {
          propertyName: 'type unmapped',
          mapping: {
            base: '#/$defs/schema1',
            child1: '#/$defs/schema2',
            child2: '#/$defs/schema3',
          },
        },
        $defs: {
          schema1: {
            type: 'object',
            properties: {
              'type unmapped': {
                type: 'string',
              },
              'base field': {
                type: 'number',
              },
            },
            required: ['base field'],
            additionalProperties: false,
          },
          schema2: {
            allOf: [
              {
                $ref: '#/$defs/schema1',
              },
              {
                type: 'object',
                properties: {
                  'type unmapped': {
                    type: 'string',
                  },
                  'child1 field': {
                    type: 'boolean',
                  },
                },
                required: ['child1 field'],
                additionalProperties: false,
              },
            ],
          },
          schema3: {
            allOf: [
              {
                $ref: '#/$defs/schema1',
              },
              {
                type: 'object',
                properties: {
                  'type unmapped': {
                    type: 'string',
                  },
                  'child2 field': {
                    type: 'boolean',
                  },
                },
                required: ['child2 field'],
                additionalProperties: false,
              },
            ],
          },
        },
      });
    });

    it('should output a valid JSON Schema as anyOf with discriminator for inheritance using regular schemas', () => {
      const type1 = object({
        type: ['type unmapped', optional(string())],
        field1: ['child1 field', boolean()],
        baseField: ['base field', number()],
      });

      const type2 = object({
        type: ['type unmapped', optional(string())],
        field2: ['child2 field', boolean()],
        baseField: ['base field', number()],
      });

      const baseType = object({
        type: ['type unmapped', optional(string())],
        baseField: ['base field', number()],
      });

      const discriminatedUnion = discriminatedObject(
        'type',
        'type unmapped',
        {
          base: baseType,
          child1: type1,
          child2: type2,
        },
        'base'
      );
      const jsonSchema = generateJSONSchema(discriminatedUnion);
      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: META_SCHEMA,
        anyOf: [
          { $ref: '#/$defs/schema1' },
          { $ref: '#/$defs/schema2' },
          { $ref: '#/$defs/schema3' },
        ],
        discriminator: {
          propertyName: 'type unmapped',
          mapping: {
            base: '#/$defs/schema1',
            child1: '#/$defs/schema2',
            child2: '#/$defs/schema3',
          },
        },
        $defs: {
          schema1: {
            type: 'object',
            properties: {
              'type unmapped': {
                type: 'string',
              },
              'base field': {
                type: 'number',
              },
            },
            required: ['base field'],
          },
          schema2: {
            type: 'object',
            properties: {
              'type unmapped': {
                type: 'string',
              },
              'child1 field': {
                type: 'boolean',
              },
              'base field': {
                type: 'number',
              },
            },
            required: ['child1 field', 'base field'],
          },
          schema3: {
            type: 'object',
            properties: {
              'type unmapped': {
                type: 'string',
              },
              'child2 field': {
                type: 'boolean',
              },
              'base field': {
                type: 'number',
              },
            },
            required: ['child2 field', 'base field'],
          },
        },
      });
    });
  });
});
