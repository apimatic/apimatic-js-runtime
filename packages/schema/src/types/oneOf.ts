import { Schema, SchemaContextCreator } from '../schema';

type SchemaType<T extends Schema<any, any>> = T extends Schema<infer U, any>
  ? U
  : never;

type ArraySchemaType<
  T extends Array<Schema<any, any>>
> = T[number] extends Schema<any, any> ? SchemaType<T[number]> : never;

type DiscriminatorMap<T extends Array<Schema<any, any>>> = {
  [K in ArraySchemaType<T>]?: Schema<ArraySchemaType<T>>;
};

type ValueOf<T> = T[keyof T];

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
      return matchAndValidateBeforeMap(schemas, value, ctxt);
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
      return matchAndValidateBeforeUnmap(schemas, value, ctxt);
    },
    map: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField,
        false
      );
      if (discriminatedSchema) {
        return discriminatedSchema.map(value, ctxt);
      }
      return matchAndMap(schemas, value, ctxt);
    },
    unmap: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField,
        false
      );
      if (discriminatedSchema) {
        return discriminatedSchema.unmap(value, ctxt);
      }
      return matchAndUnmap(schemas, value, ctxt);
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
      return matchAndValidateBeforeMapXml(schemas, value, ctxt);
    },
    mapXml: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField,
        false
      );
      if (discriminatedSchema) {
        return discriminatedSchema.mapXml(value, ctxt);
      }
      return matchAndMapXml(schemas, value, ctxt);
    },
    unmapXml: (value, ctxt) => {
      const discriminatedSchema = getDiscriminatedSchema<T>(
        value,
        discriminatorMap,
        discriminatorField,
        false
      );
      if (discriminatedSchema) {
        return discriminatedSchema.unmapXml(value, ctxt);
      }
      return matchAndUnmapXml(schemas, value, ctxt);
    },
  };
}

function getDiscriminatedSchema<T extends Array<Schema<any, any>>>(
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
