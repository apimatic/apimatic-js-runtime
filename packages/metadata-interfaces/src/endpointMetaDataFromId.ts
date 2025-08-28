import type { ApiResponse } from "@apimatic/core-interfaces";
import type { JSONSchema, Schema, SchemaMappedType, SchemaType, ValidationResult } from "@apimatic/schema";

export interface EndpointMetaDataInterface<
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

export interface RequestSchemaInterface<CoreReqSchema extends Schema<any, any>> {
  readonly schema: CoreReqSchema;

  toJSONSchema(): JSONSchema;

  validateAndMap(
    args: SchemaMappedType<CoreReqSchema>
  ): ValidationResult<SchemaType<CoreReqSchema>>;
}

export type EndpointsObject = Record<string, EndpointMetaDataInterface<any, any>>;

export type EnvVar = {
  name: string;
  description: string;
};
