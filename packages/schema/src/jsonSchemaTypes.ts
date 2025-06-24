import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import type { Schema } from './schema';

export type JSONSchemaDefinition = JSONSchema7Definition;
export type SchemaName = string;
export type SchemaRef = `#/$defs/${SchemaName}` | '#';
export interface JSONSchemaContext {
  getRootSchema: <T, V>() => Schema<T, V>;
  registerSchema: <T, V>(schema: Schema<T, V>) => SchemaName;
  getRegisteredSchema: <T, V>(schema: Schema<T, V>) => SchemaName | false;
  addDefinition: (schemaId: SchemaName, def: JSONSchemaDefinition) => void;
}
export type PartialJSONSchema = Omit<JSONSchema, '$schema' | '$defs'>;
/**
 * The equivalent JSON Schema representation of the Schema interface.
 * It targets the superset of JSON Schema 2020-12 specified in OpenAPI 3.1.0.
 * See: https://spec.openapis.org/oas/v3.1.0.html#data-types.
 * NOTE: Future compatibility with JSON Schema draft-07 is not guaranteed.
 * draft-07 was chosen as a base type since many existing libraries already use it.
 */
export interface JSONSchema extends JSONSchema7 {
  $schema: 'https://json-schema.org/draft-07/schema';
  discriminator?: {
    propertyName: string;
    mapping?: { [discriminatorValue: string]: string };
  };
}
