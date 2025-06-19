import { Schema, PartialJSONSchema, JSONSchemaContext } from './schema';

// Common type utilities for combinators
export type SchemaType<T extends Schema<any, any>> = T extends Schema<
  infer U,
  any
>
  ? U
  : never;
export type ArraySchemaType<
  T extends Array<Schema<any, any>>
> = T[number] extends Schema<any, any> ? SchemaType<T[number]> : never;

// Common type for DiscriminatorMap
export type DiscriminatorMap<T extends Array<Schema<any, any>>> = {
  [K in ArraySchemaType<T>]?: Schema<ArraySchemaType<T>>;
};

/**
 * Utility to generate JSON Schema for oneOf/anyOf with discriminators.
 */
export function toCombinatorJSONSchemaWithDiscriminator<
  T extends Array<Schema<any, any>>
>(
  schemas: [...T],
  discriminatorMap: DiscriminatorMap<T>,
  discriminatorField: string,
  oneOfOrAnyOf: 'anyOf' | 'oneOf',
  context: JSONSchemaContext
): PartialJSONSchema {
  const types: { $ref: string }[] = [];
  const discriminatorMapping: { [val: string]: string } = {};
  Object.keys(discriminatorMap).forEach((key, index) => {
    const schemaRef = context.addDefinition(
      schemas[index].toJSONSchema(context)
    );
    types.push({ $ref: schemaRef });
    discriminatorMapping[key] = schemaRef;
  });
  return {
    [oneOfOrAnyOf]: types,
    discriminator: {
      propertyName: discriminatorField,
      mapping: discriminatorMapping,
    },
  };
}
