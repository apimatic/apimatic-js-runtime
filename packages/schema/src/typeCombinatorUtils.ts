import type {
  SchemaName,
  SchemaRef,
  JSONSchemaContext,
  PartialJSONSchema,
} from './jsonSchemaTypes';
import type { Schema, SchemaContextCreator } from './schema';

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

/**
 * Type helper to work with schemas of a discriminated oneOf or anyOf type
 */
export type DiscriminatorMap<T extends Array<Schema<any, any>>> = {
  [K in ArraySchemaType<T>]?: Schema<ArraySchemaType<T>>;
};

/**
 * Utility type to extract the union of all property values of a type T.
 */
type ValueOf<T> = T[keyof T];

/**
 * Utility to generate JSON Schema for oneOf/anyOf with discriminators.
 */
export function toCombinatorJSONSchemaWithDiscriminator<
  T extends Array<Schema<any, any>>
>(
  discriminatorConfig: {
    schemas: [...T];
    discriminatorMap: DiscriminatorMap<T>;
    discriminatorField: string;
  },
  oneOfOrAnyOf: 'anyOf' | 'oneOf',
  context: JSONSchemaContext
): PartialJSONSchema {
  const { schemas, discriminatorMap, discriminatorField } = discriminatorConfig;
  const types: { $ref: SchemaRef }[] = [];
  const discriminatorMapping: { [val: SchemaName]: SchemaRef } = {};
  Object.keys(discriminatorMap).forEach((key, index) => {
    const schemaName = context.registerSchema(schemas[index]);
    context.addDefinition(schemaName, schemas[index].toJSONSchema(context));

    const schemaRef: SchemaRef = `#/$defs/${schemaName}`;
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

/**
 * Check a value's discriminator field and get its corresponding schema
 */
export function getDiscriminatedSchema<T extends Array<Schema<any, any>>>(
  value: unknown,
  discriminatorMap: DiscriminatorMap<T>,
  discriminatorField: string
): ValueOf<DiscriminatorMap<T>> | false {
  const discriminatorValue =
    value &&
    typeof value === 'object' &&
    (value as Record<string, unknown>)[discriminatorField];

  if (!discriminatorValue) {
    return false;
  }

  const schema =
    discriminatorMap[discriminatorValue as keyof DiscriminatorMap<T>];

  if (!schema) {
    return false;
  }

  return schema;
}

/**
 * Common logic for oneOf/anyOf with discriminator
 */
export function createCombinatorWithDiscriminator<T extends Array<Schema<any, any>>>(
  config: {
    schemas: T,
    discriminatorMap: DiscriminatorMap<T>,
    discriminatorField: string,
  },
  combinator: 'oneOf' | 'anyOf',
  combinatorWithoutDiscriminator: Schema<ArraySchemaType<T>>
): Schema<ArraySchemaType<T>> {
  const { schemas, discriminatorMap, discriminatorField } = config;

  /**
   * Forward method calls to a schema contained within a oneOf or anyOf schema
   */
  function forwardTo<K extends keyof Schema<ArraySchemaType<T>>>(
    method: K,
    value: unknown,
    ctxt: SchemaContextCreator
  ): ReturnType<Schema<ArraySchemaType<T>>[K]> {
    const discriminatedSchema = getDiscriminatedSchema(
      value,
      discriminatorMap,
      discriminatorField
    );
    if (discriminatedSchema) {
      return discriminatedSchema[method](value, ctxt);
    }
    return combinatorWithoutDiscriminator[method](value, ctxt);
  }

  return {
    type: () => `OneOf<${schemas.map((schema) => schema.type()).join(' | ')}>` ,
    validateBeforeMap: (value, ctxt) => forwardTo('validateBeforeMap', value, ctxt),
    validateBeforeUnmap: (value, ctxt) => forwardTo('validateBeforeUnmap', value, ctxt),
    map: (value, ctxt) => forwardTo('map', value, ctxt),
    unmap: (value, ctxt) => forwardTo('unmap', value, ctxt),
    validateBeforeMapXml: (value, ctxt) => forwardTo('validateBeforeMapXml', value, ctxt),
    mapXml: (value, ctxt) => forwardTo('mapXml', value, ctxt),
    unmapXml: (value, ctxt) => forwardTo('unmapXml', value, ctxt),
    toJSONSchema: (context): PartialJSONSchema => {
      if (!(discriminatorMap && discriminatorField)) {
        return combinatorWithoutDiscriminator.toJSONSchema(context);
      }
      return toCombinatorJSONSchemaWithDiscriminator(
        { schemas, discriminatorMap, discriminatorField },
        combinator,
        context
      );
    },
  };
}
