import { nullable, array, dict, object } from '../../src';
import { validateAndMap, validateAndUnmap } from '../../src/schema';
import { anyOf } from '../../src/types/anyOf';
import { number } from '../../src/types/number';
import { string } from '../../src/types/string';
import { Boss, bossSchema } from '../bossSchema';
import { employeeSchema } from '../employeeSchema';
import { Human, Animal, animalSchema, humanSchema } from '../types';
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
      // Array(AnyOf(string, number))
      const input: boolean[] | string[] = ['apple', 'orange'];
      const schema = anyOf([array(string()), array(number())]);
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

      const schema = anyOf([schema1, schema2], discriminatorMap, 'type');
      const output = validateAndMap(input, schema);

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

      const schema = anyOf([schema1, schema2], discriminatorMap, 'type');
      const output = validateAndUnmap(input, schema);

      expect(output.errors).toBeFalsy();
      expect((output as any).result).toStrictEqual(input); // The input should be unchanged since it matches schema1
    });
  });
});
