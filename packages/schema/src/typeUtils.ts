/**
 * Type utilities
 *
 * Some of these have been picked up from the superstruct library.
 */

import { Schema } from './schema';

/**
 * Type helper to Flatten the Union of optional and required properties.
 */
type Flatten<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

/**
 * Type helper to extract the optional keys of an object
 */
type OptionalKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

/**
 * Type helper to extract the required keys of an object
 */
type RequiredKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? never : K;
}[keyof T];

/**
 * Type helper to create optional properties when the property value can be
 * undefined (ie. when `optional()` is used to define a type)
 */
export type OptionalizeObject<T> = Flatten<
  { [K in RequiredKeys<T>]: T[K] } & { [K in OptionalKeys<T>]?: T[K] }
>;

type SchemaType<T extends Schema<any, any>> = T extends Schema<infer U, any>
  ? U
  : never;

export type ArraySchemaType<
  T extends Array<Schema<any, any>>
> = T[number] extends Schema<any, any> ? SchemaType<T[number]> : never;

/**
 * Type helper to work with schemas of a discriminated oneOf or anyOf type
 */
export type DiscriminatorMap<T extends Array<Schema<any, any>>> = {
  [K in ArraySchemaType<T>]?: Schema<ArraySchemaType<T>>;
};

type ValueOf<T> = T[keyof T];

/**
 * Check a value's discriminator field and get its corresponding schema
 */
export function getDiscriminatedSchema<T extends Array<Schema<any, any>>>(
  value: unknown,
  discriminatorMap: DiscriminatorMap<T>,
  discriminatorField: string,
  useTypeOfCheck: boolean = true
): ValueOf<DiscriminatorMap<T>> | false {
  const discriminatorValue =
    value &&
    (useTypeOfCheck ? typeof value === 'object' : true) &&
    (value as Record<string, unknown>)[discriminatorField];

  if (!discriminatorValue) {
    return false;
  }

  const schema =
    discriminatorMap[discriminatorValue as keyof DiscriminatorMap<T>];

  if (schema) {
    return schema;
  }

  return false;
}
