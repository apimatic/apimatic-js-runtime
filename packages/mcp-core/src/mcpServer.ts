import type {
  CoreClient,
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
import { getToolName } from './utils.js';

/**
 * Creates and configures a new `Server` instance with tool support capabilities,
 * prepares all tools from the provided endpoints, and sets up request handlers for
 * listing tools and calling tools.
 */
export function getServer(
  serverName: string,
  endpoints: EndpointsObject,
  sdkClient: CoreClient,
  toolsets: string[]
): Server {
  const server = new Server(
    { name: serverName, version: '1.0.0' },
    { capabilities: { tools: {} } } // Indicate tool support
  );

  // Prepare all tools from endpoints at startup
  const allTools = getAllTools(endpoints, sdkClient, toolsets);

  server.setRequestHandler(ListToolsRequestSchema, async () =>
    handleListTools(allTools)
  );
  server.setRequestHandler(CallToolRequestSchema, (request) =>
    handleCallTool(request, allTools)
  );

  return server;
}

/**
 * Handles the 'tools/list' MCP request.
 */
async function handleListTools(
  allTools: Record<string, ToolDefinition>
): Promise<ListToolsResult> {
  return {
    tools: Object.values(allTools).map((toolDefinition) => toolDefinition.tool),
  };
}

/**
 * Handles the 'tools/call' MCP request.
 */
async function handleCallTool(
  request: CallToolRequest,
  allTools: Record<string, ToolDefinition>
): Promise<CallToolResult> {
  const { name, arguments: args } = request.params;
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
  sdkClient: CoreClient,
  toolsets: string[]
): Record<string, ToolDefinition> {
  const toolMap: Record<string, ToolDefinition> = {};
  for (const endpointId in endpoints) {
    if (!endpoints.hasOwnProperty(endpointId)) {
      // Skip inherited properties
      continue;
    }

    const endpoint = endpoints[endpointId];
    if (!endpoint) {
      throw new Error(`Endpoint with id '${endpointId}' not found.`);
    }

    if (toolsets.length > 0 && !toolsets.includes(endpoint.group)) {
      continue;
    }

    const sanitizedToolName = getToolName(endpointId);
    toolMap[sanitizedToolName] = createToolFromEndpoint(
      endpointId,
      endpoint,
      sdkClient
    );
  }
  return toolMap;
}
