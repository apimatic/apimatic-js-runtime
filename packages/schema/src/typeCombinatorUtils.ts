import type {
  SchemaName,
  SchemaRef,
  JSONSchemaContext,
  PartialJSONSchema,
} from './jsonSchemaTypes';
import type { Schema } from './schema';

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
  schemas: [...T],
  discriminatorMap: DiscriminatorMap<T>,
  discriminatorField: string,
  oneOfOrAnyOf: 'anyOf' | 'oneOf',
  context: JSONSchemaContext
): PartialJSONSchema {
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
  schemas: T,
  discriminatorMap: DiscriminatorMap<T>,
  discriminatorField: string,
  withoutDiscriminator: Schema<ArraySchemaType<T>>,
  combinator: 'oneOf' | 'anyOf'
): Schema<ArraySchemaType<T>> {
  return {
    type: () => `OneOf<${schemas.map((schema) => schema.type()).join(' | ')}>` ,
    validateBeforeMap: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.validateBeforeMap(value, ctxt);
      }
      return withoutDiscriminator.validateBeforeMap(value, ctxt);
    },
    validateBeforeUnmap: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.validateBeforeUnmap(value, ctxt);
      }
      return withoutDiscriminator.validateBeforeUnmap(value, ctxt);
    },
    map: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.map(value, ctxt);
      }
      return withoutDiscriminator.map(value, ctxt);
    },
    unmap: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.unmap(value, ctxt);
      }
      return withoutDiscriminator.unmap(value, ctxt);
    },
    validateBeforeMapXml: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.validateBeforeMapXml(value, ctxt);
      }
      return withoutDiscriminator.validateBeforeMapXml(value, ctxt);
    },
    mapXml: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.mapXml(value, ctxt);
      }
      return withoutDiscriminator.mapXml(value, ctxt);
    },
    unmapXml: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.unmapXml(value, ctxt);
      }
      return withoutDiscriminator.unmapXml(value, ctxt);
    },
    toJSONSchema: (context): PartialJSONSchema => {
      if (!(discriminatorMap && discriminatorField)) {
        return {
          [combinator]: schemas.map((schema) => schema.toJSONSchema(context)),
        } as PartialJSONSchema;
      }
      return toCombinatorJSONSchemaWithDiscriminator(
        schemas,
        discriminatorMap,
        discriminatorField,
        combinator,
        context
      );
    },
  };
}
