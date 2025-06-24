import type { JSONSchema7Definition } from 'json-schema';
import type { JSONSchema, Schema } from './schema';

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

