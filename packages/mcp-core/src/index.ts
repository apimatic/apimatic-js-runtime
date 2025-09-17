import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { httpMcpServer } from './httpMcpServer.js';
import { getServer } from './mcpServer.js';
import { Command } from 'commander';
import type {
  CoreClientInterface,
  EndpointsObject,
} from '@apimatic/metadata-interfaces';

export interface McpServerConfig {
  name: string;
  description?: string;
}

export interface SdkMetadata {
  endpoints: EndpointsObject;
  clientFactory: () => CoreClientInterface;
}

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

    if (transport === 'stdio') {
      console.error(`Starting MCP Server in stdio mode...`);
      await stdioMcpServer(serverName, endpoints, client);
    } else {
      console.log('Starting MCP Server in HTTP mode...');
      httpMcpServer(serverName, port, endpoints, client);
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

async function stdioMcpServer(
  serverName: string,
  endpoints: EndpointsObject,
  client: CoreClientInterface
) {
  const stdioTransport = new StdioServerTransport();
  const server = getServer(serverName, endpoints, client);
  await server.connect(stdioTransport);
}
