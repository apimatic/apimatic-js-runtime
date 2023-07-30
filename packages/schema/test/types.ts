import { Schema } from '../lib/schema';
import { object } from '../src';
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

export interface Human {
  name: string;
  age: number;
}

export const humanSchema: Schema<Human> = object({
  name: ['name', string()],
  age: ['age', number()],
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
  age: number;
  address: Address;
}

export const personSchema: Schema<Person> = object({
  name: ['name', string()],
  age: ['age', number()],
  address: ['address', lazy(() => addressSchema)],
});

export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}
