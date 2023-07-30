import { Schema, SchemaValidationError } from '../schema';

type SchemaType<T extends Schema<any, any>> = T extends Schema<infer U, any>
  ? U
  : never;

type ArraySchemaType<
  T extends Array<Schema<any, any>>
> = T[number] extends Schema<any, any> ? SchemaType<T[number]> : never;

type DiscriminatorMap<T extends Array<Schema<any, any>>> = {
  [K in ArraySchemaType<T>]?: Schema<ArraySchemaType<T>>;
};

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
  return {
    type: () => `OneOf<${schemas.map((schema) => schema.type()).join(' | ')}>`,
    validateBeforeMap: (value, ctxt) => {
      const discriminatorValue =
        value && typeof value === 'object' && value[discriminatorField];
      if (discriminatorValue && discriminatorMap[discriminatorValue]) {
        return discriminatorMap[discriminatorValue].validateBeforeMap(
          value,
          ctxt
        );
      }

      const matchedSchemas: Array<Schema<any, any>> = [];

      for (const schema of schemas) {
        const validationErrors = schema.validateBeforeMap(value, ctxt);
        if (validationErrors.length === 0) {
          matchedSchemas.push(schema);
        }
      }

      if (matchedSchemas.length > 0) {
        return [];
      } else {
        return ctxt.fail('Did not match any schema.');
      }
    },
    validateBeforeUnmap: (value, ctxt) => {
      const discriminatorValue =
        value && typeof value === 'object' && value[discriminatorField];
      if (discriminatorValue && discriminatorMap[discriminatorValue]) {
        return discriminatorMap[discriminatorValue].validateBeforeUnmap(
          value,
          ctxt
        );
      }

      const matchedSchemas: Array<Schema<any, any>> = [];

      for (const schema of schemas) {
        const validationErrors = schema.validateBeforeUnmap(value, ctxt);
        if (validationErrors.length === 0) {
          matchedSchemas.push(schema);
        }
      }

      if (matchedSchemas.length > 1) {
        return [];
      } else {
        return ctxt.fail('Did not match any schema.');
      }
    },
    map: (value, ctxt) => {
      const discriminatorValue = value && value[discriminatorField];
      if (discriminatorValue && discriminatorMap[discriminatorValue]) {
        return discriminatorMap[discriminatorValue].map(value, ctxt);
      }

      const matchedSchemas: Array<Schema<any, any>> = [];
      for (const schema of schemas) {
        if (schema.validateBeforeMap(value, ctxt).length === 0) {
          matchedSchemas.push(schema);
        }
      }
      if (matchedSchemas.length > 0) {
        return matchedSchemas[0].map(value, ctxt);
      } else {
        return undefined;
      }
    },
    unmap: (value, ctxt) => {
      const discriminatorValue = value && value[discriminatorField];
      if (discriminatorValue && discriminatorMap[discriminatorValue]) {
        return discriminatorMap[discriminatorValue].unmap(value, ctxt);
      }

      const matchedSchemas: Array<Schema<any, any>> = [];
      for (const schema of schemas) {
        if (schema.validateBeforeUnmap(value, ctxt).length === 0) {
          matchedSchemas.push(schema);
        }
      }
      if (matchedSchemas.length > 0) {
        return matchedSchemas[0].unmap(value, ctxt);
      } else {
        return undefined;
      }
    },
    validateBeforeMapXml: (value, ctxt) => {
      const discriminatorValue =
        value && typeof value === 'object' && value[discriminatorField];
      if (discriminatorValue && discriminatorMap[discriminatorValue]) {
        return discriminatorMap[discriminatorValue].validateBeforeMapXml(
          value,
          ctxt
        );
      }

      const matchedSchemas: Array<Schema<any, any>> = [];
      const errors: SchemaValidationError[] = [];

      for (const schema of schemas) {
        const validationErrors = schema.validateBeforeMapXml(value, ctxt);
        if (validationErrors.length === 0) {
          matchedSchemas.push(schema);
        } else {
          // The schema didn't match, add the validation errors to the main error list
          errors.push(...validationErrors);
        }
      }

      if (matchedSchemas.length > 0) {
        return [];
      } else {
        return ctxt.fail('Did not match any schema.');
      }
    },
    mapXml: (value, ctxt) => {
      const discriminatorValue = value && value[discriminatorField];
      if (discriminatorValue && discriminatorMap[discriminatorValue]) {
        return discriminatorMap[discriminatorValue].mapXml(value, ctxt);
      }

      const matchedSchemas: Array<Schema<any, any>> = [];
      for (const schema of schemas) {
        if (schema.validateBeforeMapXml(value, ctxt).length === 0) {
          matchedSchemas.push(schema);
        }
      }
      if (matchedSchemas.length > 0) {
        return matchedSchemas[0].mapXml(value, ctxt);
      } else {
        return undefined;
      }
    },
    unmapXml: (value, ctxt) => {
      const discriminatorValue = value && value[discriminatorField];
      if (discriminatorValue && discriminatorMap[discriminatorValue]) {
        return discriminatorMap[discriminatorValue].unmapXml(value, ctxt);
      }

      const matchedSchemas: Array<Schema<any, any>> = [];
      for (const schema of schemas) {
        if (schema.validateBeforeMapXml(value, ctxt).length === 0) {
          matchedSchemas.push(schema);
        }
      }
      if (matchedSchemas.length > 0) {
        return matchedSchemas[0].unmapXml(value, ctxt);
      } else {
        return undefined;
      }
    },
  };
}

function createAnyOfWithoutDiscriminator<T extends Array<Schema<any, any>>>(
  schemas: T
): Schema<ArraySchemaType<T>> {
  return {
    type: () => `OneOf<${schemas.map((schema) => schema.type()).join(' | ')}>`,
    validateBeforeMap: (value, ctxt) => {
      const matchedSchemas: Array<Schema<any, any>> = [];

      for (const schema of schemas) {
        const validationErrors = schema.validateBeforeMap(value, ctxt);
        if (validationErrors.length === 0) {
          matchedSchemas.push(schema);
        }
      }

      if (matchedSchemas.length > 0) {
        return [];
      } else {
        return ctxt.fail('Did not match any schema.');
      }
    },
    validateBeforeUnmap: (value, ctxt) => {
      const matchedSchemas: Array<Schema<any, any>> = [];

      for (const schema of schemas) {
        const validationErrors = schema.validateBeforeUnmap(value, ctxt);
        if (validationErrors.length === 0) {
          matchedSchemas.push(schema);
        }
      }

      if (matchedSchemas.length > 0) {
        return [];
      } else {
        return ctxt.fail('Did not match any schema.');
      }
    },
    map: (value, ctxt) => {
      const matchedSchemas: Array<Schema<any, any>> = [];
      for (const schema of schemas) {
        if (schema.validateBeforeMap(value, ctxt).length === 0) {
          matchedSchemas.push(schema);
        }
      }
      if (matchedSchemas.length > 0) {
        return matchedSchemas[0].map(value, ctxt);
      } else {
        return undefined;
      }
    },
    unmap: (value, ctxt) => {
      const matchedSchemas: Array<Schema<any, any>> = [];
      for (const schema of schemas) {
        if (schema.validateBeforeUnmap(value, ctxt).length === 0) {
          matchedSchemas.push(schema);
        }
      }
      if (matchedSchemas.length > 0) {
        return matchedSchemas[0].unmap(value, ctxt);
      } else {
        return undefined;
      }
    },
    validateBeforeMapXml: (value, ctxt) => {
      const matchedSchemas: Array<Schema<any, any>> = [];
      const errors: SchemaValidationError[] = [];

      for (const schema of schemas) {
        const validationErrors = schema.validateBeforeMapXml(value, ctxt);
        if (validationErrors.length === 0) {
          matchedSchemas.push(schema);
        } else {
          // The schema didn't match, add the validation errors to the main error list
          errors.push(...validationErrors);
        }
      }

      if (matchedSchemas.length > 0) {
        return [];
      } else {
        return ctxt.fail('Did not match any schema.');
      }
    },
    mapXml: (value, ctxt) => {
      const matchedSchemas: Array<Schema<any, any>> = [];
      for (const schema of schemas) {
        if (schema.validateBeforeMapXml(value, ctxt).length === 0) {
          matchedSchemas.push(schema);
        }
      }
      if (matchedSchemas.length > 0) {
        return matchedSchemas[0].mapXml(value, ctxt);
      } else {
        return undefined;
      }
    },
    unmapXml: (value, ctxt) => {
      const matchedSchemas: Array<Schema<any, any>> = [];
      for (const schema of schemas) {
        if (schema.validateBeforeMapXml(value, ctxt).length === 0) {
          matchedSchemas.push(schema);
        }
      }
      if (matchedSchemas.length > 0) {
        return matchedSchemas[0].unmapXml(value, ctxt);
      } else {
        return undefined;
      }
    },
  };
}
