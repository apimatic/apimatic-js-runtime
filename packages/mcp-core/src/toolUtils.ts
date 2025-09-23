import {
  type CallToolResult,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createErrorMessage, getToolName, stringifyRawJson } from './utils.js';
import type {
  CoreClient,
  EndpointMetadataInterface,
  EndpointsObject,
} from '@apimatic/metadata-interfaces';
import type { JSONSchema } from '@apimatic/metadata-interfaces';

export type ToolDefinition = {
  tool: Tool;
  handler: (arg: unknown) => Promise<CallToolResult>;
};

export function createToolFromEndpoint(
  endpointId: string,
  endpoints: EndpointsObject,
  sdkClient: CoreClient
): ToolDefinition {
  const endpoint = endpoints[endpointId];
  if (!endpoint) {
    throw new Error(`Endpoint with id '${endpointId}' not found.`);
  }
  const schema: JSONSchema = endpoint.requestSchema.toJSONSchema();
  if (!isObjectSchema(schema)) {
    // Required by Model Context Protocol SDK
    throw new Error('Request schema must be an object type!');
  }

  return {
    tool: {
      name: getToolName(endpoint.group, endpoint.name),
      description: endpoint.description,
      inputSchema: schema as ObjectJSONSchema,
    },
    handler: (args) => handleEndpoint(endpoint, args, sdkClient),
  };
}

async function handleEndpoint(
  endpoint: EndpointMetadataInterface<any, any>,
  args: unknown,
  sdkClient: CoreClient
): Promise<CallToolResult> {
  const validationResult = endpoint.requestSchema.validateAndMap(args as any);
  if (validationResult.errors) {
    return {
      content: validationResult.errors.map((error: any) => ({
        type: 'text',
        text: stringifyRawJson(error),
      })),
      isError: true,
    };
  }

  const result = validationResult.result;
  try {
    const response = await endpoint.call(sdkClient, result);
    return {
      content: [
        {
          type: 'text',
          text: stringifyRawJson({
            statusCode: response.statusCode,
            responseHeaders: response.headers,
            result: response.body,
          }),
        },
      ],
    };
  } catch (error) {
    return await createErrorMessage(error);
  }
}

type ObjectJSONSchema = {
  type: 'object';
  [x: string]: unknown;
} & any;

function isObjectSchema(schema: JSONSchema): schema is ObjectJSONSchema {
  return schema && schema.type === 'object';
}
