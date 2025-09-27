import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { httpMcpServer } from './httpMcpServer.js';
import { getServer } from './mcpServer.js';
import { Command } from 'commander';
import type {
  CoreClient,
  EndpointsObject,
} from '@apimatic/metadata-interfaces';
import type { Server } from '@modelcontextprotocol/sdk/server';

export interface McpServerConfig {
  name: string;
  description?: string;
}

export interface SdkMetadata {
  endpoints: EndpointsObject;
  clientFactory: () => CoreClient;
}

/**
 * Executes the MCP Server CLI, initializing and starting the server based on the provided configuration and SDK metadata.
 *
 * This function parses command-line arguments to determine the server's transport mode (`http` or `stdio`) and port.
 * It then starts the MCP server accordingly, handling any initialization errors and reporting them to the console.
 */
export async function executeMcpServerCli(
  sdkMetadata: SdkMetadata,
  mcpServerConfig: McpServerConfig
) {
  const program = new Command();

  program
    .option('-p, --port <number>', 'Port to run the server on', '3000')
    .option('-t, --transport <string>', 'Transport (http | stdio)', 'http');

  program.parse(process.argv);
  const options = program.opts();

  const transport = options.transport;
  const port = parseInt(options.port, 10);
  const serverName = mcpServerConfig.name;

  try {
    const { clientFactory, endpoints } = sdkMetadata;
    const client = clientFactory();
    const server = getServer(serverName, endpoints, client);

    if (transport === 'stdio') {
      console.error(`Starting MCP Server in stdio mode...`);
      await stdioMcpServer(server);
    } else {
      console.log('Starting MCP Server in HTTP mode...');
      httpMcpServer(serverName, port, server);
    }
  } catch (err: any) {
    if (err instanceof McpError) {
      console.error(`❌ MCP Error ${err.code}: ${err.message}`);
    } else {
      console.error(`❌ Failed to start MCP server: ${err.message}`);
    }

    process.exit(1);
  }
}

/**
 * Initializes and starts an MCP server using standard input/output (stdio) as the transport layer.
 */
async function stdioMcpServer(server: Server) {
  const stdioTransport = new StdioServerTransport();
  await server.connect(stdioTransport);
}
