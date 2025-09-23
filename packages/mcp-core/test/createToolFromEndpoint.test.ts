import test from 'node:test';
import assert from 'node:assert/strict';
import { createToolFromEndpoint } from '../src/toolUtils.js';
import type {
  CoreClient,
  EndpointMetadataInterface,
  EndpointsObject,
  RequestSchemaInterface,
} from '@apimatic/metadata-interfaces';

test('createToolFromEndpoint returns ToolDefinition and handler calls endpoint', async () => {
  const requestSchema: RequestSchemaInterface<any> = {
    toJSONSchema: () => ({
      type: 'object',
      properties: { id: { type: 'string' } },
    }),
    validateAndMap: (args: any) => ({ errors: false, result: args }),
  };

  const endpoints: EndpointsObject = {
    'orders-CreateOrder': {
      name: 'CreateOrder',
      group: 'orders',
      requestSchema,
      call: async (_client: any, mappedRequest: any) => {
        return {
          request: {
            method: 'POST',
            url: 'https://api.example.com/orders',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              type: 'text',
              content: JSON.stringify(mappedRequest),
            },
          },
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          result: { id: '123' },
          body: JSON.stringify({ id: '123' }),
        };
      },
      description: 'Creates an order',
    } satisfies EndpointMetadataInterface<any, { id: string }>,

    'orders-GetOrder': {
      name: 'GetOrder',
      group: 'orders',
      requestSchema,
      call: async (_client: any, mappedRequest: any) => {
        return {
          request: {
            method: 'GET',
            url: `https://api.example.com/orders/${mappedRequest.id}`,
            headers: {
              Accept: 'application/json',
            },
          },
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          result: { id: '456' },
          body: JSON.stringify({ id: '456' }),
        };
      },
      description: 'Gets an order',
    } satisfies EndpointMetadataInterface<any, { id: string }>,
  };

  const sdkClient = {} as unknown as CoreClient;

  const toolDef = createToolFromEndpoint(
    'orders-CreateOrder',
    endpoints,
    sdkClient
  );

  // Check metadata
  assert.equal(toolDef.tool.name, 'orders-create_order');
  assert.equal(toolDef.tool.description, 'Creates an order');
  assert.equal(toolDef.tool.inputSchema.type, 'object');

  // Call handler and verify response
  const result = await toolDef.handler({ id: '123' });
  assert.deepEqual(result, {
    content: [
      {
        type: 'text',
        text: '{"statusCode":200,"responseHeaders":{"Content-Type":"application/json"},"result":"{\\"id\\":\\"123\\"}"}',
      },
    ],
  });
});

test('createToolFromEndpoint throws if endpoint does not exist', () => {
  const endpoints = {};
  assert.throws(
    () => createToolFromEndpoint('missing', endpoints as any, {} as any),
    /Endpoint with id 'missing' not found/
  );
});

test('createToolFromEndpoint throws if schema is not object type', () => {
  const endpointId = 'badEndpoint';
  const endpoints = {
    [endpointId]: {
      description: 'Invalid schema',
      requestSchema: {
        toJSONSchema: () => ({ type: 'string' }), // not an object
      },
    },
  } as any;

  assert.throws(
    () => createToolFromEndpoint(endpointId, endpoints, {} as any),
    /Request schema must be an object type/
  );
});
