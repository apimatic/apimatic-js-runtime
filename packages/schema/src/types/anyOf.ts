import { Schema, SchemaContextCreator } from '../schema';
import {
  DiscriminatorMap,
  ArraySchemaType,
  createCombinatorWithDiscriminator,
} from '../typeCombinatorUtils';

export function anyOf<T extends Array<Schema<any, any>>>(
  schemas: [...T],
  discriminatorMap?: DiscriminatorMap<T>,
  discriminatorField?: string
): Schema<ArraySchemaType<T>> {
  if (discriminatorMap && discriminatorField) {
    return createCombinatorWithDiscriminator(
      { schemas, discriminatorMap, discriminatorField },
      'anyOf',
      createAnyOfWithoutDiscriminator(schemas)
    );
  } else {
    return createAnyOfWithoutDiscriminator(schemas);
  }
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
