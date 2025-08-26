import type { JSONSchema7 } from 'json-schema';
import type { Schema } from './schema';

export const META_SCHEMA = 'https://json-schema.org/draft-07/schema';

export type SchemaName = string;
export type SchemaRef = `#/$defs/${SchemaName}` | '#';
export interface JSONSchemaContext {
  /**
   * Returns a reference to a schema if it's been visited.
   * Adds the schema to the registry if it hasn't been visited yet.
   * @param schema Schema to check
   * @returns Schema reference
   */
  getOrRegisterSchema: <T, V>(schema: Schema<T, V>) => SchemaRef;
}
export type PartialJSONSchema = Omit<JSONSchema, '$schema' | '$defs'>;

/**
 * The equivalent JSON Schema representation of the Schema interface.
 * It targets the superset of JSON Schema 2020-12 specified in OpenAPI 3.1.0.
 * See: https://spec.openapis.org/oas/v3.1.0.html#data-types.
 * NOTE: Future compatibility with JSON Schema draft-07 is not guaranteed.
 * draft-07 was chosen as a base type since many existing libraries already use it.
 */
export type JSONSchema = OpenAPIExtension<JSONSchema7>;

type OpenAPIExtension<T> = T extends object
  ? { [K in keyof T]: OpenAPIExtension<T[K]> } & {
      discriminator?: {
        propertyName: string;
        mapping?: { [discriminatorValue: string]: string };
      };
    }
  : T;
