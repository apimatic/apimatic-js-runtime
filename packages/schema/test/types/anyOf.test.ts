import { type JSONSchema, nullable, array, dict, object, generateJSONSchema } from '../../src';
import { validateAndMap, validateAndUnmap } from '../../src/schema';
import { anyOf } from '../../src/types/anyOf';
import { number } from '../../src/types/number';
import { string } from '../../src/types/string';
import { Boss, bossSchema } from '../bossSchema';
import { employeeSchema } from '../employeeSchema';
import { Human, Animal, animalSchema, humanSchema, anyOfWithDiscriminator } from '../types';
import { boolean } from '../../src/types/boolean';
describe('AnyOf', () => {
  describe('Mapping', () => {
    it('should accept anyOf primitives', () => {
      const input = 1;
      const schema = anyOf([string(), number()]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf primitives or complex types', () => {
      const input: Boss = {
        promotedAt: 45,
      };
      const schema = anyOf([bossSchema, number()]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf complex types', () => {
      const input: Boss = {
        promotedAt: 45,
      };
      const schema = anyOf([bossSchema, employeeSchema]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf with nullable values', () => {
      const input: string | null = null;
      const schema = anyOf([string(), number(), nullable(string())]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf with outer array types', () => {
      // Array(AnyOf(string, number))
      const input: Array<string | number> = ['apple', 10, 'orange', 20];
      const schema = array(anyOf([string(), number()]));
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf with inner array types', () => {
      // AnyOf(Array(string, number))
      const input: boolean[] | string[] = ['apple', 'orange'];
      const schema = anyOf([array(string()), array(number())]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf with array of map types', () => {
      // AnyOf(Array(dict(boolean)), Array(dict(number)))
      const input:
        | Array<Record<string, number>>
        | Array<Record<string, boolean>> = [{ keyA: 1 }, { keyB: 2 }];
      const schema = anyOf([array(dict(boolean())), array(dict(number()))]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf with map of array types', () => {
      // AnyOf(dict(array(boolean)), dict(array(number)))
      const input: Record<string, number[]> | Record<string, boolean[]> = {
        keyA: [true, false],
      };
      const schema = anyOf([dict(array(boolean())), dict(array(number()))]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf with nested array types', () => {
      const input: Array<Array<string | number>> = [
        ['apple', 10],
        ['orange', 20],
      ];
      const schema = array(array(anyOf([string(), number()])));
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf with nested recod types', () => {
      const input: Record<string, Record<string, string | number>> = {
        person1: { name: 'John', age: 30 },
        person2: { name: 'Jane', age: 25 },
      };
      const schema = dict(dict(anyOf([number(), string()])));
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf primitives, objects, and dictionaries', () => {
      const input: Human | Animal = {
        name: 'John',
        age: 25,
      };
      const schema = anyOf([animalSchema, humanSchema]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf outer dictionaries with different value types', () => {
      const input: Record<string, string | number> = {
        name: 'John',
        age: 30,
        city: 'New York',
      };
      const schema = dict(anyOf([string(), number()]));
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map anyOf inner dictionaries with different value types', () => {
      const input: Record<string, number> | Record<string, string> = {
        name: 'John',
        city: 'New York',
      };
      const schema = anyOf([dict(string()), dict(number())]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map values that do not match any of the schemas', () => {
      const input: Human = {
        name: 'John',
        age: 30,
      };
      const schema = anyOf([animalSchema, dict(number())]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeTruthy();
      expect((output as any).result).toBeUndefined();
    });

    it('should map anyOf with discriminator', () => {
      const input = {
        type: 'object1', // The discriminator field value that matches schema1
        name: 'John',
        age: 30,
      };

      const output = validateAndMap(input, anyOfWithDiscriminator);

      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input); // The input should be unchanged since it matches schema1
    });
  });

  describe('Unmapping', () => {
    it('should unmap anyOf primitives', () => {
      const input = 'Hello';
      const schema = anyOf([string(), number()]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf complex types', () => {
      const input: Boss = {
        promotedAt: 45,
      };
      const schema = anyOf([bossSchema, employeeSchema]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf with nullable values', () => {
      const input: string | null = null;
      const schema = anyOf([string(), number(), nullable(string())]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf with array types', () => {
      // Array(AnyOf(string, number))
      const input: Array<string | number> = ['apple', 10, 'orange', 20];
      const schema = array(anyOf([string(), number()]));
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf with inner array types', () => {
      // Array(AnyOf(string, number))
      const input: boolean[] | string[] = ['apple', 'orange'];
      const schema = anyOf([array(string()), array(number())]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf with array of map types', () => {
      // AnyOf(Array(dict(boolean)), Array(dict(number)))
      const input:
        | Array<Record<string, number>>
        | Array<Record<string, boolean>> = [{ keyA: 1 }, { keyB: 2 }];
      const schema = anyOf([array(dict(boolean())), array(dict(number()))]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf with map of array types', () => {
      // AnyOf(dict(array(boolean)), dict(array(number)))
      const input: Record<string, number[]> | Record<string, boolean[]> = {
        keyA: [true, false],
      };
      const schema = anyOf([dict(array(boolean())), dict(array(number()))]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf with nested array types', () => {
      const input: Array<Array<string | number>> = [
        ['apple', 10],
        ['orange', 20],
      ];
      const schema = array(array(anyOf([string(), number()])));
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf with nested recod types', () => {
      const input: Record<string, Record<string, string | number>> = {
        person1: { name: 'John', age: 30 },
        person2: { name: 'Jane', age: 25 },
      };
      const schema = dict(dict(anyOf([number(), string()])));
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf primitives, objects, and dictionaries', () => {
      const input: Human | Animal = {
        name: 'John',
        age: 25,
      };
      const schema = anyOf([animalSchema, humanSchema]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf dictionaries with different value types', () => {
      const input: Record<string, string | number> = {
        name: 'John',
        age: 30,
        city: 'New York',
      };
      const schema = dict(anyOf([string(), number()]));
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf inner dictionaries with different value types', () => {
      const input: Record<string, number> | Record<string, string> = {
        name: 'John',
        city: 'New York',
      };
      const schema = anyOf([dict(string()), dict(number())]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap anyOf with discriminator', () => {
      const input = {
        type: 'object1', // The discriminator field value that matches schema1
        name: 'John',
        age: 30,
      };

      const output = validateAndUnmap(input, anyOfWithDiscriminator);

      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input); // The input should be unchanged since it matches schema1
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema for anyOf primitive types', () => {
      const jsonSchema = generateJSONSchema(anyOf([string(), number()]));

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        anyOf: [
          {
            type: 'string'
          },
          {
            type: 'number'
          }
        ]
      });
    });

    it('should output a valid JSON Schema for anyOf objects without discriminator', () => {
      const schema = anyOf([
        object({
          name: ['name', string()],
        }),
        object({
          title: ['title', string()],
        })
      ]);
      const jsonSchema = generateJSONSchema(schema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        anyOf: [
          {
            type: 'object',
            required: ['name'],
            properties: {
              name: {
                type: 'string'
              }
            }
          },
          {
            type: 'object',
            required: ['title'],
            properties: {
              title: {
                type: 'string'
              }
            }
          }
        ]
      });
    });

    it('should output a valid JSON Schema for anyOf objects with discriminator', () => {
      const firstSchema = object({
        type: ['type', string()],
        name: ['name', string()],
      });

      const secondSchema = object({
        type: ['type', string()],
        title: ['title', string()],
      });

      const discriminatorMap = {
        object1: firstSchema,
        object2: secondSchema,
      };

      const schema = anyOf([firstSchema, secondSchema], discriminatorMap, 'type');
      const jsonSchema = generateJSONSchema(schema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: 'https://json-schema.org/draft-07/schema',
        anyOf: [
          {
            $ref: '#/$defs/schema1'
          },
          {
            $ref: '#/$defs/schema2'
          }
        ],
        discriminator: {
          propertyName: 'type',
          mapping: {
            object1: '#/$defs/schema1',
            object2: '#/$defs/schema2'
          }
        },
        $defs: {
          schema1: {
            type: 'object',
            required: ['type', 'name'],
            properties: {
              type: {
                type: 'string'
              },
              name: {
                type: 'string'
              }
            }
          },
          schema2: {
            type: 'object',
            required: ['type', 'title'],
            properties: {
              type: {
                type: 'string'
              },
              title: {
                type: 'string'
              }
            }
          }
        }
      });
    });
  });
});
