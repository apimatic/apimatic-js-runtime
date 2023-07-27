import { Schema } from '../schema';

type SchemaType<T extends Schema<any, any>> = T extends Schema<infer U, any>
  ? U
  : never;
type ArraySchemaType<
  T extends Array<Schema<any, any>>
> = T[number] extends Schema<any, any> ? SchemaType<T[number]> : never;

export function anyOf<T extends Array<Schema<any, any>>>(
  schemas: [...T]
): Schema<ArraySchemaType<T>> {
  return {
    type: () => `AnyOf<${schemas.map((schema) => schema.type()).join(' | ')}>`,
    validateBeforeMap: (value, ctxt) => {
      const matchedSchema = schemas.find(
        (schema) => schema.validateBeforeMap(value, ctxt).length === 0
      );
      if (matchedSchema) {
        return [];
      } else {
        return ctxt.fail();
      }
    },
    validateBeforeUnmap: (value, ctxt) => {
      const matchedSchema = schemas.find(
        (schema) => schema.validateBeforeUnmap(value, ctxt).length === 0
      );
      if (matchedSchema) {
        return [];
      } else {
        return ctxt.fail();
      }
    },
    map: (value, ctxt) => {
      const matchedSchema = schemas.find(
        (schema) => schema.validateBeforeMap(value, ctxt).length === 0
      );
      if (matchedSchema) {
        return matchedSchema.map(value, ctxt);
      } else {
        return undefined;
      }
    },
    unmap: (value, ctxt) => {
      const matchedSchema = schemas.find(
        (schema) => schema.validateBeforeUnmap(value, ctxt).length === 0
      );
      if (matchedSchema) {
        return matchedSchema.unmap(value, ctxt);
      } else {
        return undefined;
      }
    },
    validateBeforeMapXml: (value, ctxt) => {
      const matchedSchema = schemas.find(
        (schema) => schema.validateBeforeMapXml(value, ctxt).length === 0
      );
      if (matchedSchema) {
        return [];
      } else {
        return ctxt.fail();
      }
    },
    mapXml: (value, ctxt) => {
      const matchedSchema = schemas.find(
        (schema) => schema.validateBeforeMapXml(value, ctxt).length === 0
      );
      if (matchedSchema) {
        return matchedSchema.mapXml(value, ctxt);
      } else {
        return undefined;
      }
    },
    unmapXml: (value, ctxt) => {
      const matchedSchema = schemas.find(
        (schema) => schema.validateBeforeMapXml(value, ctxt).length === 0
      );
      if (matchedSchema) {
        return matchedSchema.unmapXml(value, ctxt);
      } else {
        return undefined;
      }
    },
  };
}
