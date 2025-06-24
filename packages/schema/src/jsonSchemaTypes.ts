import { type JSONSchema7Definition } from "json-schema";

export type JSONSchemaDefinition = JSONSchema7Definition;
export type SchemaName = string;
export type SchemaRef = `#/$defs/${SchemaName}` | '#';
