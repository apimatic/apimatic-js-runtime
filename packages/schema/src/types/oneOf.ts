import { Schema, SchemaContextCreator } from '../schema';
import { PartialJSONSchema } from '../jsonSchemaTypes';
import {
  toCombinatorJSONSchemaWithDiscriminator,
  DiscriminatorMap,
  ArraySchemaType,
  getDiscriminatedSchema,
} from '../typeCombinatorUtils';

export function oneOf<T extends Array<Schema<any, any>>>(
  schemas: [...T],
  discriminatorMap?: DiscriminatorMap<T>,
  discriminatorField?: string
): Schema<ArraySchemaType<T>> {
  if (discriminatorMap && discriminatorField) {
    return createOneOfWithDiscriminator(
      schemas,
      discriminatorMap,
      discriminatorField
    );
  } else {
    return createOneOfWithoutDiscriminator(schemas);
  }
}

function createOneOfWithDiscriminator<T extends Array<Schema<any, any>>>(
  schemas: T,
  discriminatorMap: DiscriminatorMap<T>,
  discriminatorField: string
): Schema<ArraySchemaType<T>> {
  const oneOfWithoutDiscriminator = createOneOfWithoutDiscriminator(schemas);
  return {
    type: () => `OneOf<${schemas.map((schema) => schema.type()).join(' | ')}>`,

    validateBeforeMap: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.validateBeforeMap(value, ctxt);
      }
      return oneOfWithoutDiscriminator.validateBeforeMap(value, ctxt);
    },
    validateBeforeUnmap: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.validateBeforeUnmap(value, ctxt);
      }
      return oneOfWithoutDiscriminator.validateBeforeUnmap(value, ctxt);
    },
    map: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.map(value, ctxt);
      }
      return oneOfWithoutDiscriminator.map(value, ctxt);
    },
    unmap: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.unmap(value, ctxt);
      }
      return oneOfWithoutDiscriminator.unmap(value, ctxt);
    },
    validateBeforeMapXml: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.validateBeforeMapXml(value, ctxt);
      }
      return oneOfWithoutDiscriminator.validateBeforeMapXml(value, ctxt);
    },
    mapXml: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.mapXml(value, ctxt);
      }
      return oneOfWithoutDiscriminator.mapXml(value, ctxt);
    },
    unmapXml: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField
      );
      if (discriminatedSchema) {
        return discriminatedSchema.unmapXml(value, ctxt);
      }
      return oneOfWithoutDiscriminator.unmapXml(value, ctxt);
    },
    toJSONSchema: (context): PartialJSONSchema => {
      if (!(discriminatorMap && discriminatorField)) {
        return {
          oneOf: schemas.map((schema) => schema.toJSONSchema(context)),
        };
      }
      return toCombinatorJSONSchemaWithDiscriminator(
        schemas,
        discriminatorMap,
        discriminatorField,
        'oneOf',
        context
      );
    },
  };
}

function createOneOfWithoutDiscriminator<T extends Array<Schema<any, any>>>(
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
      oneOf: schemas.map((schema) => schema.toJSONSchema(context)),
    }),
  };
}

function matchAndValidateBeforeMap<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: unknown,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];
  ctxt.strictValidation = true;
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
  ctxt.strictValidation = true;
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
  ctxt.strictValidation = true;
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
  if (schemas.length === 1) {
    return [];
  }

  if (schemas.length === 0) {
    return ctxt.fail('Could not match against any acceptable type.');
  }

  return ctxt.fail(
    `Matched more than one type. Matched types include: ${schemas
      .map((schema) => schema.type())
      .join(', ')}`
  );
}

function matchAndMap<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: any,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];
  ctxt.strictValidation = true;

  for (const schema of schemas) {
    if (schema.validateBeforeMap(value, ctxt).length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return matchedSchemas.length === 1
    ? matchedSchemas[0].map(value, ctxt)
    : undefined;
}

function matchAndUnmap<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: any,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];
  ctxt.strictValidation = true;

  for (const schema of schemas) {
    if (schema.validateBeforeUnmap(value, ctxt).length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return matchedSchemas.length === 1
    ? matchedSchemas[0].unmap(value, ctxt)
    : undefined;
}

function matchAndMapXml<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: any,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];
  ctxt.strictValidation = true;

  for (const schema of schemas) {
    if (schema.validateBeforeMapXml(value, ctxt).length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return matchedSchemas.length === 1
    ? matchedSchemas[0].mapXml(value, ctxt)
    : undefined;
}

function matchAndUnmapXml<T extends Array<Schema<any, any>>>(
  schemas: T,
  value: any,
  ctxt: SchemaContextCreator
) {
  const matchedSchemas: Array<Schema<any, any>> = [];
  ctxt.strictValidation = true;

  for (const schema of schemas) {
    if (schema.validateBeforeMapXml(value, ctxt).length === 0) {
      matchedSchemas.push(schema);
    }
  }
  return matchedSchemas.length === 1
    ? matchedSchemas[0].unmapXml(value, ctxt)
    : undefined;
}
