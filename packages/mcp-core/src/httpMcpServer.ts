import express from 'express';
import type { Request, Response, Express } from 'express';
import cors from 'cors';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { InMemoryEventStore } from '@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js';
import { randomUUID } from 'node:crypto';
import { getServer } from './mcpServer.js';
import type {
  CoreClient,
  EndpointsObject,
} from '@apimatic/metadata-interfaces';

/**
 * Starts an HTTP MCP server using Express.
 *
 * NOTE: Currently ALL CORS Requests are allowed.
 *
 * @param serverName MCP Server Name that MCP Clients will see on initialization.
 * @param port Port number to listen on
 * @param endpoints Object containing metadata for all SDK endpoints
 * @param sdkClient SDK client instance used for API calls
 */
export function httpMcpServer(
  serverName: string,
  port: number,
  endpoints: EndpointsObject,
  sdkClient: CoreClient
) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Map to store transports by session ID
  const transports: Transports = {};

  mapEndpoints(app, serverName, transports, endpoints, sdkClient);

  app.listen(port, () => {
    console.log(`${serverName} MCP Server listening on port ${port}`);
    console.log(`
      ==============================================
      USING THE FOLLOWING TRANSPORT:

         Streamable Http(Protocol version: 2025-03-26)
         Endpoint: /mcp
         Methods: GET, POST, DELETE
         Usage:
           - Initialize with POST to /mcp
           - Establish SSE stream with GET to /mcp
           - Send requests with POST to /mcp
           - Terminate session with DELETE to /mcp
      ==============================================
      `);
  });

  // Handle server shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down server...');

    // Close all active transports to properly clean up resources
    for (const sessionId in transports) {
      if (!transports.hasOwnProperty(sessionId)) {
        continue;
      }
      try {
        console.log(`Closing transport for session ${sessionId}`);
        await transports[sessionId]?.close();
        delete transports[sessionId];
      } catch (error) {
        console.error(
          `Error closing transport for session ${sessionId}:`,
          error
        );
      }
    }
    console.log('Server shutdown complete');
    process.exit(0);
  });
}

/**
 * Stores active transport instances by session ID for stateful flows.
 */
type Transports = {
  [sessionId: string]: StreamableHTTPServerTransport;
};

/**
 * Sets up Express routes for MCP protocol endpoints, handling POST, GET, and DELETE requests for session management and streaming.
 */
function mapEndpoints(
  app: Express,
  serverName: string,
  transports: Transports,
  endpoints: EndpointsObject,
  sdkClient: CoreClient
) {
  // =============================================================================
  // STREAMABLE HTTP TRANSPORT (PROTOCOL VERSION 2025-03-26)
  // =============================================================================

  app.post('/mcp', async (req: Request, res: Response) => {
    console.log('Received MCP request:', req.body);
    // Check for existing session ID
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (sessionId) {
      await handleStatefulMCPRequest(
        sessionId,
        transports,
        req,
        res,
        serverName,
        endpoints,
        sdkClient
      );
    } else {
      await handleStatelessMCPRequest(
        req,
        res,
        serverName,
        endpoints,
        sdkClient
      );
    }
  });

  // Handle GET requests for SSE streams (using built-in support from StreamableHTTP)
  app.get('/mcp', async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    // Check for Last-Event-ID header for resumability
    const lastEventId = req.headers['last-event-id'] as string | undefined;
    if (lastEventId) {
      console.log(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
    } else {
      console.log(`Establishing new SSE stream for session ${sessionId}`);
    }

    const transport = transports[sessionId] as StreamableHTTPServerTransport;
    await transport.handleRequest(req, res);
  });

  // Handle DELETE requests for session termination (according to MCP spec)
  app.delete('/mcp', async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    console.log(
      `Received session termination request for session ${sessionId}`
    );

    try {
      const transport = transports[sessionId] as StreamableHTTPServerTransport;
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error('Error handling session termination:', error);
      if (!res.headersSent) {
        res.status(500).send('Error processing session termination');
      }
    }
  });
}

/**
 * Handles MCP requests for sessions with a session ID, supporting initialization, reuse, and error handling for stateful communication.
 */
async function handleStatefulMCPRequest(
  sessionId: string,
  transports: Transports,
  req: Request,
  res: Response,
  serverName: string,
  endpoints: EndpointsObject,
  sdkClient: CoreClient
) {
  console.log('Handling stateful request...');
  try {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId] && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId] as StreamableHTTPServerTransport;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      const eventStore = new InMemoryEventStore();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        eventStore, // Enable resumability
        onsessioninitialized: (sessionIdParam) => {
          // Store the transport by session ID when session is initialized
          // This avoids race conditions where requests might come in before the session is stored
          console.log(`Session initialized with ID: ${sessionIdParam}`);
          transports[sessionIdParam] = transport;
        },
      });

      // Set up onclose handler to clean up transport when closed
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          console.log(
            `Transport closed for session ${sid}, removing from transports map`
          );
          delete transports[sid];
        }
      };

      // Connect the transport to the MCP server BEFORE handling the request
      // so responses can flow back through the same transport
      const server = getServer(serverName, endpoints, sdkClient);
      await server.connect(transport);

      await transport.handleRequest(req, res, req.body);
      return; // Already handled
    } else {
      // Invalid request - no session ID or not initialization request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }

    // Handle the request with existing transport - no need to reconnect
    // The existing transport is already connected to the server
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
}

/**
 * Processes MCP requests that do not use session IDs, enabling stateless interactions and automatic resource cleanup.
 */
async function handleStatelessMCPRequest(
  req: Request,
  res: Response,
  serverName: string,
  endpoints: EndpointsObject,
  sdkClient: CoreClient
) {
  console.log('Handling stateless request...');
  const server = getServer(serverName, endpoints, sdkClient);
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('close', () => {
      console.log('Request closed');
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
}
