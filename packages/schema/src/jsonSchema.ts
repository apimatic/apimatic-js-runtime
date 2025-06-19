import { JSONSchema, JSONSchemaContext, Schema } from "./schema";

export function generateJSONSchema<T extends Schema<any, any>>(schema: T): JSONSchema {
  const context: JSONSchemaContext = {
    $defs: {},
    partialJsonSchema: {}
  };
  const partialJsonSchema = schema.toJSONSchema(context);

  return {
    $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
    ...partialJsonSchema,
  };
}