import { Schema, SchemaContextCreator } from '../schema';
import { PartialJSONSchema } from '../jsonSchemaTypes';
import {
  toCombinatorJSONSchemaWithDiscriminator,
  DiscriminatorMap,
  ArraySchemaType,
  getDiscriminatedSchema,
} from '../typeCombinatorUtils';

export function anyOf<T extends Array<Schema<any, any>>>(
  schemas: [...T],
  discriminatorMap?: DiscriminatorMap<T>,
  discriminatorField?: string
): Schema<ArraySchemaType<T>> {
  if (discriminatorMap && discriminatorField) {
    return createAnyOfWithDiscriminator(
      schemas,
      discriminatorMap,
      discriminatorField
    );
  } else {
    return createAnyOfWithoutDiscriminator(schemas);
  }
}

function createAnyOfWithDiscriminator<T extends Array<Schema<any, any>>>(
  schemas: T,
  discriminatorMap: DiscriminatorMap<T>,
  discriminatorField: string
): Schema<ArraySchemaType<T>> {
  const anyOfWithoutDiscriminator = createAnyOfWithoutDiscriminator(schemas);
  return {
    type: () => `OneOf<${schemas.map((schema) => schema.type()).join(' | ')}>`,
    validateBeforeMap: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.validateBeforeMap(value, ctxt);
      }
      return anyOfWithoutDiscriminator.validateBeforeMap(value, ctxt);
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
      return anyOfWithoutDiscriminator.validateBeforeUnmap(value, ctxt);
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
      return anyOfWithoutDiscriminator.map(value, ctxt);
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
      return anyOfWithoutDiscriminator.unmap(value, ctxt);
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
      return anyOfWithoutDiscriminator.validateBeforeMapXml(value, ctxt);
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
      return anyOfWithoutDiscriminator.mapXml(value, ctxt);
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
      return anyOfWithoutDiscriminator.unmapXml(value, ctxt);
    },
    toJSONSchema: (context): PartialJSONSchema => {
      if (!(discriminatorMap && discriminatorField)) {
        return {
          anyOf: schemas.map((schema) => schema.toJSONSchema(context)),
        };
      }
      return toCombinatorJSONSchemaWithDiscriminator(
        schemas,
        discriminatorMap,
        discriminatorField,
        'anyOf',
        context
      );
    },
  };
}

function createAnyOfWithoutDiscriminator<T extends Array<Schema<any, any>>>(
  schemas: T
): Schema<ArraySchemaType<T>> {
  return {
    type: () => `OneOf<${schemas.map((schema) => schema.type()).join(' | ')}>`,
    validateBeforeMap: (value, ctxt) =>
      matchAndValidateBeforeMap(schemas, value, ctxt),
    validateBeforeUnmap: (value, ctxt) =>
      matchAndValidateBeforeUnmap(schemas, value, ctxt),
    map: (value, ctxt) => matchAndMap(schemas, value, ctxt),
    unmap: (value, ctxt) => matchAndUnmap(schemas, value, ctxt),
    validateBeforeMapXml: (value, ctxt) =>
      matchAndValidateBeforeMapXml(schemas, value, ctxt),
    mapXml: (value, ctxt) => matchAndMapXml(schemas, value, ctxt),
    unmapXml: (value, ctxt) => matchAndUnmapXml(schemas, value, ctxt),
    toJSONSchema: (context) => ({
      anyOf: schemas.map((schema) => schema.toJSONSchema(context)),
    }),
  };
}

function matchAndValidateBeforeMap<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: unknown,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];

  for (const schema of schemas) {
    const validationErrors = schema.validateBeforeMap(value, ctxt);
    if (validationErrors.length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return validateSchemas(matchedSchemas, ctxt);
}

function matchAndValidateBeforeUnmap<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: unknown,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];

  for (const schema of schemas) {
    const validationErrors = schema.validateBeforeUnmap(value, ctxt);
    if (validationErrors.length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return validateSchemas(matchedSchemas, ctxt);
}

function matchAndValidateBeforeMapXml<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: unknown,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];

  for (const schema of schemas) {
    const validationErrors = schema.validateBeforeMapXml(value, ctxt);
    if (validationErrors.length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return validateSchemas(matchedSchemas, ctxt);
}

function validateSchemas<T extends Array<Schema<any, any>>>(
  schemas: T,
  ctxt: SchemaContextCreator
) {
  if (schemas.length > 0) {
    return [];
  }
  return ctxt.fail('Could not match against any acceptable type.');
}

function matchAndMap<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: any,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];
  for (const schema of schemas) {
    if (schema.validateBeforeMap(value, ctxt).length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return matchedSchemas.length > 0
    ? matchedSchemas[0].map(value, ctxt)
    : undefined;
}

function matchAndUnmap<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: any,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];
  for (const schema of schemas) {
    if (schema.validateBeforeUnmap(value, ctxt).length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return matchedSchemas.length > 0
    ? matchedSchemas[0].unmap(value, ctxt)
    : undefined;
}

function matchAndMapXml<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: any,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];
  for (const schema of schemas) {
    if (schema.validateBeforeMapXml(value, ctxt).length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return matchedSchemas.length > 0
    ? matchedSchemas[0].mapXml(value, ctxt)
    : undefined;
}

function matchAndUnmapXml<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: any,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];
  for (const schema of schemas) {
    if (schema.validateBeforeMapXml(value, ctxt).length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return matchedSchemas.length > 0
    ? matchedSchemas[0].unmapXml(value, ctxt)
    : undefined;
}
