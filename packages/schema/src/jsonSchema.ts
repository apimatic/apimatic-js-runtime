import type {
  JSONSchema,
  JSONSchemaContext,
  JSONSchemaDefinition,
  Schema,
} from './schema';

export function generateJSONSchema<T extends Schema<any, any>>(
  schema: T
): JSONSchema {
  const defsArr: JSONSchemaDefinition[] = [];
  const context: JSONSchemaContext = {
    addDefinition: (def) => {
      const existingDefIdx = defsArr.findIndex((storedDef) => storedDef === def);
      if (existingDefIdx !== -1) {
        return `#/$defs/schema${existingDefIdx + 1}`;
      }

      defsArr.push(def);
      return `#/$defs/schema${defsArr.length}`;
    },
  };
  const partialJsonSchema = schema.toJSONSchema(context);

  if (defsArr.length === 0) {
    return {
      $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
      ...partialJsonSchema,
    };
  }

  const $defs = {};
  defsArr.forEach((def, idx) => {
    $defs[`schema${idx + 1}`] = def;
  });

  return {
    $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
    ...partialJsonSchema,
    $defs: $defs,
  };
}
