import type { SchemaRef } from '../jsonSchemaTypes';
import type { Schema } from '../schema';
import type { JSONSchemaContext } from '../jsonSchemaTypes';
import { once } from '../utils';

/**
 * Create a schema that lazily delegates to the given schema.
 */
export function lazy<T, V>(schemaFn: () => Schema<T, V>): Schema<T, V> {
  const getSchema = once(schemaFn); // Memoize schema
  return {
    type: () => `Lazy<${getSchema().type()}>`,
    map: (...args) => getSchema().map(...args),
    unmap: (...args) => getSchema().unmap(...args),
    validateBeforeMap: (...args) => getSchema().validateBeforeMap(...args),
    validateBeforeUnmap: (...args) => getSchema().validateBeforeUnmap(...args),
    mapXml: (...args) => getSchema().mapXml(...args),
    unmapXml: (...args) => getSchema().unmapXml(...args),
    validateBeforeMapXml: (...args) =>
      getSchema().validateBeforeMapXml(...args),
    toJSONSchema: (context) => getLazyJSONSchema(context, getSchema()),
  };
}

function getLazyJSONSchema<T, V>(
  context: JSONSchemaContext,
  schema: Schema<T, V>
): {
  $ref: SchemaRef;
} {
  if (schema === context.getRootSchema()) {
    return {
      $ref: '#',
    };
  }

  const existingSchemaName = context.getRegisteredSchema(schema);
  if (existingSchemaName) {
    return {
      $ref: `#/$defs/${existingSchemaName}`,
    };
  }

  const schemaName = context.registerSchema(schema);
  const jsonSchema = schema.toJSONSchema(context);
  context.addDefinition(schemaName, jsonSchema);
  return {
    $ref: `#/$defs/${schemaName}`,
  };
}
