import { JSONSchema, JSONSchemaContext, Schema } from './schema';

export function generateJSONSchema<T extends Schema<any, any>>(
  schema: T
): JSONSchema {
  const context: JSONSchemaContext = {
    $defs: [],
  };
  const partialJsonSchema = schema.toJSONSchema(context);

  if (context.$defs.length === 0) {
    return {
      $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
      ...partialJsonSchema,
    };
  }

  const $defs = {};
  context.$defs.forEach((def, idx) => {
    $defs[`schema${idx + 1}`] = def;
  });

  return {
    $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
    ...partialJsonSchema,
    $defs: $defs,
  };
}
