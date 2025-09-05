import {
  type SchemaName,
  type JSONSchemaContext,
  type JSONSchema,
  type PartialJSONSchema,
  META_SCHEMA,
} from './jsonSchemaTypes';
import type { Schema } from './schema';

export function generateJSONSchema<T extends Schema<any, any>>(
  rootSchema: T
): JSONSchema {
  const schemaRegistry: Map<Schema<any, any>, SchemaName> = new Map();
  const $defs: Record<SchemaName, PartialJSONSchema> = {};
  const context: JSONSchemaContext = {
    getOrRegisterSchema: (schema) => {
      if (schema === rootSchema) {
        return { $ref: '#' };
      }

      const existingSchemaName = schemaRegistry.get(schema);
      if (existingSchemaName) {
        return { $ref: `#/$defs/${existingSchemaName}` };
      }

      const schemaName = `schema${schemaRegistry.size + 1}`;
      schemaRegistry.set(schema, schemaName);
      $defs[schemaName] ??= schema.toJSONSchema(context);
      return { $ref: `#/$defs/${schemaName}` };
    },
  };
  const partialJsonSchema = rootSchema.toJSONSchema(context);

  return {
    $schema: META_SCHEMA,
    ...partialJsonSchema,
    ...(schemaRegistry.size > 0 && { $defs }),
  };
}
