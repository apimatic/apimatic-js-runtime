import type {
  CoreClientInterface,
  EndpointsObject,
} from '@apimatic/metadata-interfaces';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  type CallToolRequest,
  type CallToolResult,
  type ListToolsResult,
} from '@modelcontextprotocol/sdk/types.js';
import { createToolFromEndpoint, type ToolDefinition } from './toolUtils.js';

export function getServer(
  serverName: string,
  endpoints: EndpointsObject,
  sdkClient: CoreClientInterface
): Server {
  const server = new Server(
    { name: serverName, version: '1.0.0' },
    { capabilities: { tools: {} } } // Indicate tool support
  );

  server.setRequestHandler(ListToolsRequestSchema, async () =>
    handleListTools(endpoints, sdkClient)
  );
  server.setRequestHandler(CallToolRequestSchema, (request) =>
    handleCallTool(request, endpoints, sdkClient)
  );

  return server;
}

/**
 * Handles the 'tools/list' MCP request.
 */
async function handleListTools(
  endpoints: EndpointsObject,
  sdkClient: CoreClientInterface
): Promise<ListToolsResult> {
  const allTools = getAllTools(endpoints, sdkClient);
  return {
    tools: Object.values(allTools).map((toolDefinition) => toolDefinition.tool),
  };
}

/**
 * Handles the 'tools/call' MCP request.
 */
async function handleCallTool(
  request: CallToolRequest,
  endpoints: EndpointsObject,
  sdkClient: CoreClientInterface
): Promise<CallToolResult> {
  const { name, arguments: args } = request.params;
  const allTools = getAllTools(endpoints, sdkClient);
  const toolDefinition = allTools[name];
  if (toolDefinition) {
    return await toolDefinition.handler(args);
  }
  throw new McpError(ErrorCode.MethodNotFound, `Tool '${name}' not found`);
}

/**
 * Adapt the endpoint list to an MCP tool definition list
 */
function getAllTools(
  endpoints: EndpointsObject,
  sdkClient: CoreClientInterface
): Record<string, ToolDefinition> {
  const toolMap: Record<string, ToolDefinition> = {};
  for (const key in endpoints) {
    if (!endpoints.hasOwnProperty(key)) { continue; }
    const endpointId = key;
    toolMap[endpointId] = createToolFromEndpoint(
      endpointId,
      endpoints,
      sdkClient
    );
  }
  return toolMap;
}
