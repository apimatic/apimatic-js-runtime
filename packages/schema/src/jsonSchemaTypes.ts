import type { JSONSchema7 } from 'json-schema';
import type { Schema } from './schema';

export const META_SCHEMA = 'https://json-schema.org/draft-07/schema';

export type SchemaName = string;
export type SchemaRef = `#/$defs/${SchemaName}` | '#';
export interface JSONSchemaContext {
  /**
   * @returns the Schema that is being converted to JSON Schema
   * i.e. the root of the schema tree
   */
  getRootSchema: <T, V>() => Schema<T, V>;
  /**
   * The context maintains a collection of schemas that have been visited.
   * Use this to add a schema that has been visited.
   */
  registerSchema: <T, V>(schema: Schema<T, V>) => SchemaName;
  /**
   * Can be used for checking if a schema has already been visited
   * e.g. recursive schemas
   * @returns schema name if it has been visited otherwise returns false
   */
  getRegisteredSchema: <T, V>(schema: Schema<T, V>) => SchemaName | false;
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
