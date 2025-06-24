import { type Schema } from '../src/schema';
import { anyOf, bigint, boolean, object, oneOf, optional } from '../src';
import { string } from '../src/types/string';
import { number } from '../src/types/number';
import { validateAndMap } from '../src/schema';
import { lazy } from '../src/types/lazy';
export interface Animal {
  species: string;
  age: number;
}

export const animalSchema: Schema<Animal> = object({
  species: ['species', string()],
  age: ['age', number()],
});

export interface AllOptional {
  name?: string;
  age?: number;
}

export const allOptionalSchema: Schema<AllOptional> = object({
  name: ['name', optional(string())],
  age: ['age', optional(number())],
});

export interface Human {
  name: string;
  age: number;
  id?: bigint | string;
  hasChildren?: boolean | string;
}

export const humanSchema: Schema<Human> = object({
  name: ['name', string()],
  age: ['age', number()],
  id: ['id', optional(oneOf([string(), bigint()]))],
  hasChildren: ['hasChildren', optional(oneOf([string(), boolean()]))],
});

export function isHuman(value: unknown): value is Human {
  const validationResult = validateAndMap(value, humanSchema);
  if (validationResult.errors) {
    return false;
  }
  return true;
}

export interface Address {
  street: string;
  city: string;
}

export const addressSchema: Schema<Address> = object({
  street: ['street', string()],
  city: ['city', string()],
});

export interface Person {
  name: string;
  age: number | string;
  address: Address;
}

export const personSchema: Schema<Person> = object({
  name: ['name', string()],
  age: ['age', oneOf([string(), number()])],
  address: ['address', lazy(() => addressSchema)],
});

export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

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


export const anyOfWithDiscriminator = anyOf([schema1, schema2], discriminatorMap, 'type');
export const oneOfWithDiscriminator = oneOf([schema1, schema2], discriminatorMap, 'type');