import {
  type SchemaName,
  type JSONSchemaContext,
  type JSONSchema,
  type PartialJSONSchema,
  META_SCHEMA,
} from './jsonSchemaTypes';
import type { Schema } from './schema';

export function generateJSONSchema<T extends Schema<any, any>>(
  schema: T
): JSONSchema {
  const schemaRegistry: Map<Schema<any, any>, SchemaName> = new Map();
  const $defs: Record<SchemaName, PartialJSONSchema> = {};
  const context: JSONSchemaContext = {
    getRootSchema: () => schema,
    registerSchema: (s) => {
      const schemaName = `schema${schemaRegistry.size + 1}`;
      schemaRegistry.set(s, schemaName);
      return schemaName;
    },
    getRegisteredSchema: (s) => schemaRegistry.get(s) ?? false,
    addDefinition: (name, def) => {
      $defs[name] ??= def;
    },
  };
  const partialJsonSchema = schema.toJSONSchema(context);

  return {
    $schema: META_SCHEMA,
    ...partialJsonSchema,
    ...(schemaRegistry.size > 0 && { $defs }),
  };
}
