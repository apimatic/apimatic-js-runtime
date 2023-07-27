// Remove typed param
// Give name to the types
// Errors

import { Schema, SchemaValidationError } from '../schema';

type SchemaType<T extends Schema<any, any>> = T extends Schema<infer U, any>
  ? U
  : never;
type ArraySchemaType<
  T extends Array<Schema<any, any>>
> = T[number] extends Schema<any, any> ? SchemaType<T[number]> : never;

export function oneOf<T extends Array<Schema<any, any>>>(
  schemas: [...T]
): Schema<ArraySchemaType<T>> {
  return {
    type: () => `OneOf<${schemas.map((schema) => schema.type()).join(' | ')}>`,
    validateBeforeMap: (value, ctxt) => {
      const matchedSchemas: Array<Schema<any, any>> = [];
      const errors: SchemaValidationError[] = [];

      for (const schema of schemas) {
        const validationErrors = schema.validateBeforeMap(value, ctxt);
        if (validationErrors.length === 0) {
          matchedSchemas.push(schema);
        } else {
          // The schema didn't match, add the validation errors to the main error list
          errors.push(...validationErrors);
        }
      }

      if (matchedSchemas.length === 1) {
        return [];
      } else if (matchedSchemas.length === 0) {
        return ctxt.fail();
      } else {
        return errors;
      }
    },
    validateBeforeUnmap: (value, ctxt) => {
      const matchingSchemas: Array<Schema<any, any>> = [];
      const errors: SchemaValidationError[] = [];

      for (const schema of schemas) {
        const validationErrors = schema.validateBeforeUnmap(value, ctxt);
        if (validationErrors.length === 0) {
          matchingSchemas.push(schema);
        } else {
          errors.push(...validationErrors);
        }
      }

      if (matchingSchemas.length === 1) {
        return [];
      } else if (matchingSchemas.length === 0) {
        return ctxt.fail();
      } else {
        return errors;
      }
    },
    map: (value, ctxt) => {
      const matchedSchemas: Array<Schema<any, any>> = [];
      for (const schema of schemas) {
        if (schema.validateBeforeMap(value, ctxt).length === 0) {
          matchedSchemas.push(schema);
        }
      }
      if (matchedSchemas.length === 1) {
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
      if (matchedSchemas.length === 1) {
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

      if (matchedSchemas.length === 1) {
        return [];
      } else if (matchedSchemas.length === 0) {
        return ctxt.fail();
      } else {
        return errors;
      }
    },
    mapXml: (value, ctxt) => {
      const matchedSchemas: Array<Schema<any, any>> = [];
      for (const schema of schemas) {
        if (schema.validateBeforeMapXml(value, ctxt).length === 0) {
          matchedSchemas.push(schema);
        }
      }
      if (matchedSchemas.length === 1) {
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
      if (matchedSchemas.length === 1) {
        return matchedSchemas[0].unmapXml(value, ctxt);
      } else {
        return undefined;
      }
    },
  };
}
