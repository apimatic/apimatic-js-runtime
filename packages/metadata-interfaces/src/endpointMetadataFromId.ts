import type { ApiResponse } from '@apimatic/core-interfaces';
import type {
  JSONSchema,
  Schema,
  SchemaMappedType,
  SchemaType,
  ValidationResult,
} from '@apimatic/schema';

/**
 * Interface representing all metadata for a single endpoint, including:
 * - Name and group for organizational purposes.
 * - Request schema for validating and mapping input data.
 * - Call function to execute the API call using the provided client and mapped request data.
 * - Optional description for documentation purposes.
 *
 * @template CoreReqSchema The core schema type used for request validation and mapping.
 * @template Result The deserialized result type of the API response.
 */
export interface EndpointMetadataInterface<
  CoreReqSchema extends Schema<any, any>,
  Result
> {
  readonly name: string;
  readonly group: string;
  readonly requestSchema: RequestSchemaInterface<CoreReqSchema>;
  readonly call: (
    client: any,
    mappedRequest: SchemaType<CoreReqSchema>
  ) => Promise<ApiResponse<Result>>;
  readonly description?: string;
}

/** Interface representing a request schema with methods for:
 * - Converting to JSON Schema format.
 * - Validating and mapping input arguments to the desired type.
 * @template CoreReqSchema The core schema type used for request validation and mapping.
 */
export interface RequestSchemaInterface<
  CoreReqSchema extends Schema<any, any>
> {
  toJSONSchema(): JSONSchema;
  validateAndMap(
    args: SchemaMappedType<CoreReqSchema>
  ): ValidationResult<SchemaType<CoreReqSchema>>;
}

/**
 * The container for all endpoint metadata in the SDK, where each key is the endpoint ID.
 */
export type EndpointsObject = Record<
  string,
  EndpointMetadataInterface<any, any>
>;
