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

  const endpoint: EndpointMetadataInterface<any, { id: string }> = {
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
  };

  const sdkClient = {} as unknown as CoreClient;

  const toolDef = createToolFromEndpoint(
    'orders-CreateOrder',
    endpoint,
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

test('createToolFromEndpoint throws if schema is not object type', () => {
  const endpointId = 'badEndpoint';
  const endpoint: EndpointMetadataInterface<any, any> = {
    name: 'BadEndpoint',
    group: 'test',
    requestSchema: {
      toJSONSchema: () => ({ type: 'string' }), // not an object
      validateAndMap: () => {
        throw new Error('Not implemented');
      },
    },
    call: async () => {
      throw new Error('Not implemented');
    },
  };

  assert.throws(
    () => createToolFromEndpoint(endpointId, endpoint, {} as any),
    /Request schema must be an object type/
  );
});
