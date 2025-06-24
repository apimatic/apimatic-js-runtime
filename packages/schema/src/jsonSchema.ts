import type {
  JSONSchemaDefinition,
  SchemaName,
  JSONSchemaContext,
  JSONSchema,
} from './jsonSchemaTypes';
import type { Schema } from './schema';

export function generateJSONSchema<T extends Schema<any, any>>(
  schema: T
): JSONSchema {
  const schemaRegistry: Map<Schema<any, any>, SchemaName> = new Map();
  const $defs: Record<SchemaName, JSONSchemaDefinition> = {};
  const context: JSONSchemaContext = {
    getRootSchema: () => schema,
    registerSchema: (s) => {
      const schemaName = `schema${schemaRegistry.size + 1}`;
      schemaRegistry.set(s, schemaName);
      return schemaName;
    },
    getRegisteredSchema: (s) => schemaRegistry.get(s) ?? false,
    addDefinition: (schemaName, def) => {
      if ($defs[schemaName]) {
        return;
      }

      $defs[schemaName] = def;
    },
  };
  const partialJsonSchema = schema.toJSONSchema(context);

  if (schemaRegistry.size === 0) {
    return {
      $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
      ...partialJsonSchema,
    };
  }

  return {
    $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
    ...partialJsonSchema,
    $defs: $defs,
  };
}
