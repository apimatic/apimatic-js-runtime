import { array, boolean, object } from '../../src';
import { validateAndMap, validateAndUnmap } from '../../src/schema';
import { nullable } from '../../src/types/nullable';
import { number } from '../../src/types/number';
import { oneOf } from '../../src/types/oneOf';
import { string } from '../../src/types/string';
import { Boss, bossSchema } from '../bossSchema';
import { employeeSchema } from '../employeeSchema';
import {
  Address,
  addressSchema,
  Animal,
  animalSchema,
  Color,
  Human,
  humanSchema,
  Person,
  personSchema,
} from '../types';
import { dict } from '../../src/types/dict';
import { stringEnum } from '../../src/types/stringEnum';

describe('OnyOf', () => {
  describe('Mapping', () => {
    it('should map oneOf primitives', () => {
      const input = 1;
      const schema = oneOf([string(), number()]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf primitives or complex types', () => {
      const input: Boss = {
        promotedAt: 45,
      };
      const schema = oneOf([bossSchema, number()]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf complex types', () => {
      const input: Boss = {
        promotedAt: 45,
      };
      const schema = oneOf([bossSchema, employeeSchema]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf with nullable values', () => {
      const input: string | null = null;
      const schema = oneOf([string(), number(), nullable(string())]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf with outer array', () => {
      const input: Array<string | number> = ['apple', 10, 'orange', 20];
      const schema = array(oneOf([string(), number()]));
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf with inner array', () => {
      const input: string[] | number[] = [10, 20];
      const schema = oneOf([array(string()), array(number())]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf primitives, objects, and dictionaries', () => {
      const input: Human | Animal = {
        name: 'John',
        age: 25,
      };
      const schema = oneOf([animalSchema, humanSchema]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf outer dictionaries', () => {
      const input: Record<string, string | number> = {
        name: 'John',
        age: 30,
        city: 'New York',
      };
      const schema = dict(oneOf([string(), number()]));
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf inner dictionaries', () => {
      const input: Record<string, number> | Record<string, string> = {
        name: 'John',
        city: 'New York',
      };
      const schema = oneOf([dict(string()), dict(number())]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf with array of map types', () => {
      // oneOf(Array(dict(boolean)), Array(dict(number)))
      const input:
        | Array<Record<string, number>>
        | Array<Record<string, boolean>> = [{ keyA: 1 }, { keyB: 2 }];
      const schema = oneOf([array(dict(boolean())), array(dict(number()))]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf with map of array types', () => {
      // oneOf(dict(array(boolean)), dict(array(number)))
      const input: Record<string, number[]> | Record<string, boolean[]> = {
        keyA: [true, false],
      };
      const schema = oneOf([dict(array(boolean())), dict(array(number()))]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf with nested array types', () => {
      const input: Array<Array<string | number>> = [
        ['apple', 10],
        ['orange', 20],
      ];
      const schema = array(array(oneOf([string(), number()])));
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf with nested recod types', () => {
      const input: Record<string, Record<string, string | number>> = {
        person1: { name: 'John', age: 30 },
        person2: { name: 'Jane', age: 25 },
      };
      const schema = dict(dict(oneOf([number(), string()])));
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should reject values that do not match any of the schemas', () => {
      const input: Human = {
        name: 'John',
        age: 30,
      };
      const schema = oneOf([animalSchema, dict(number())]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeTruthy();
      expect((output as any).result).toBeUndefined();
    });

    it('should map oneOf with nullable complex types', () => {
      const input: Human | null = null;
      const schema = oneOf([humanSchema, nullable(humanSchema)]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should reject oneOf with enum and string schemas', () => {
      const colorSchema = stringEnum(Color);
      const input: Color = Color.Green;
      const schema = oneOf([colorSchema, string()]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeTruthy();
      expect((output as any).result).toBeUndefined();
    });

    it('should handle oneOf with deep nesting', () => {
      const input: Person | Address = {
        name: 'John',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'New York',
        },
      };

      const schema = oneOf([personSchema, addressSchema]);
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should map oneOf with discriminator', () => {
      const schema1 = object({
        type: ['type', string()],
        name: ['name', string()],
        age: ['age', number()],
      });

      const schema2 = object({
        type: ['type', string()],
        title: ['title', string()],
        rating: ['rating', string()],
      });

      const discriminatorMap = {
        object1: schema1,
        object2: schema2,
      };

      const input = {
        type: 'object1', // The discriminator field value that matches schema1
        name: 'John',
        age: 30,
      };

      const schema = oneOf([schema1, schema2], discriminatorMap, 'type');
      const output = validateAndMap(input, schema);

      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input); // The input should be unchanged since it matches schema1
    });
  });

  describe('Unmapping', () => {
    it('should unmap oneOf primitives', () => {
      const input = 1;
      const schema = oneOf([string(), number()]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf primitives or complex types', () => {
      const input: Boss = {
        promotedAt: 45,
      };
      const schema = oneOf([bossSchema, number()]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf complex types', () => {
      const input: Boss = {
        promotedAt: 45,
      };
      const schema = oneOf([bossSchema, employeeSchema]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf outer array types', () => {
      const input: Array<string | number> = ['apple', 10, 'orange', 20];
      const schema = array(oneOf([string(), number()]));
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with inner array', () => {
      const input: string[] | number[] = [10, 20];
      const schema = oneOf([array(string()), array(number())]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with array of map types', () => {
      // oneOf(Array(dict(boolean)), Array(dict(number)))
      const input:
        | Array<Record<string, number>>
        | Array<Record<string, boolean>> = [{ keyA: 1 }, { keyB: 2 }];
      const schema = oneOf([array(dict(boolean())), array(dict(number()))]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with map of array types', () => {
      // oneOf(dict(array(boolean)), dict(array(number)))
      const input: Record<string, number[]> | Record<string, boolean[]> = {
        keyA: [true, false],
      };
      const schema = oneOf([dict(array(boolean())), dict(array(number()))]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf primitives, objects, and dictionaries', () => {
      const input: Human | Animal = {
        name: 'John',
        age: 25,
      };
      const schema = oneOf([animalSchema, humanSchema]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with nullable complex types', () => {
      const input: Human | null = null;
      const schema = oneOf([humanSchema, nullable(humanSchema)]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf outer dictionaries with different value types', () => {
      const input: Record<string, string | number> = {
        name: 'John',
        age: 30,
        city: 'New York',
      };
      const schema = dict(oneOf([string(), number()]));
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf inner dictionaries', () => {
      const input: Record<string, number> | Record<string, string> = {
        name: 'John',
        city: 'New York',
      };
      const schema = oneOf([dict(string()), dict(number())]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with enum values', () => {
      const input: Color = Color.Green;
      const schema = oneOf([stringEnum(Color), number()]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with deep nesting', () => {
      const input: Person | Address = {
        name: 'John',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'New York',
        },
      };

      const schema = oneOf([personSchema, addressSchema]);
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with array types', () => {
      const input: Array<string | number> = ['apple', 10, 'orange', 20];
      const schema = array(oneOf([string(), number()]));
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with nested array types', () => {
      const input: Array<Array<string | number>> = [
        ['apple', 10],
        ['orange', 20],
      ];
      const schema = array(array(oneOf([string(), number()])));
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with dictionary types', () => {
      const input: Record<string, string | number> = {
        name: 'John',
        age: 30,
      };
      const schema = dict(oneOf([number(), string()]));
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with nested recod types', () => {
      const input: Record<string, Record<string, string | number>> = {
        person1: { name: 'John', age: 30 },
        person2: { name: 'Jane', age: 25 },
      };
      const schema = dict(dict(oneOf([number(), string()])));
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input);
    });

    it('should unmap oneOf with discriminator', () => {
      const schema1 = object({
        type: ['type', string()],
        name: ['name', string()],
        age: ['age', number()],
      });

      const schema2 = object({
        type: ['type', string()],
        title: ['title', string()],
        rating: ['rating', string()],
      });

      const discriminatorMap = {
        object1: schema1,
        object2: schema2,
      };

      const input = {
        type: 'object1', // The discriminator field value that matches schema1
        name: 'John',
        age: 30,
      };

      const schema = oneOf([schema1, schema2], discriminatorMap, 'type');
      const output = validateAndUnmap(input, schema);

      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input); // The input should be unchanged since it matches schema1
    });
  });
});
