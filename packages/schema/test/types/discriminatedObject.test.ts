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
} from '../../src';
import type { JSONSchema } from '../../src';

describe('Discriminated Object', () => {
  const baseType = strictObject({
    type: ['type mapped', optional(string())],
    baseField: ['base field', number()],
  });

  const childType1 = extendStrictObject(baseType, {
    type: ['type mapped', optional(string())],
    child1Field: ['child1 field', boolean()],
  });

  const childType2 = extendStrictObject(baseType, {
    type: ['type mapped', optional(string())],
    child2Field: ['child2 field', boolean()],
  });

  const discriminatedSchema = discriminatedObject(
    'type',
    'type mapped',
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
        'type mapped': 'child1',
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
        'type mapped': 'hello world',
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
        'type mapped': 'base',
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
        'type mapped': 'hello world',
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
        'type mapped': 'child1',
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
                "type mapped": "child1",
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
        'type mapped': 'child1',
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
        'type mapped': 'hello world',
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
        'type mapped': 'base',
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
        'type mapped': 'hello world',
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
    it('should output a valid JSON Schema as oneOf with discriminator', () => {
      const jsonSchema = generateJSONSchema(discriminatedSchema);
      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
        oneOf: [
          {
            $ref: '#/$defs/schema1',
          },
          {
            $ref: '#/$defs/schema2',
          },
          {
            $ref: '#/$defs/schema3',
          },
        ],
        discriminator: {
          propertyName: 'type mapped',
          mapping: {
            base: '#/$defs/schema1',
            child1: '#/$defs/schema2',
            child2: '#/$defs/schema3',
          },
        },
        $defs: {
          schema1: {
            type: 'object',
            required: ['baseField'],
            properties: {
              type: {
                type: 'string',
              },
              baseField: {
                type: 'number',
              },
            },
          },
          schema2: {
            type: 'object',
            required: ['baseField', 'child1Field'],
            properties: {
              type: {
                type: 'string',
              },
              baseField: {
                type: 'number',
              },
              child1Field: {
                type: 'boolean',
              },
            },
          },
          schema3: {
            type: 'object',
            required: ['baseField', 'child2Field'],
            properties: {
              type: {
                type: 'string',
              },
              baseField: {
                type: 'number',
              },
              child2Field: {
                type: 'boolean',
              },
            },
          },
        },
      });
    });
  });
});
