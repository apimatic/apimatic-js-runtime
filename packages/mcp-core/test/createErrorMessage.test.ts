import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createErrorMessage } from '../src/utils.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

test('createErrorMessage handles API error with statusCode, headers, and body', async () => {
  const error = {
    statusCode: 500,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'Internal Server Error' }),
  };

  const result: CallToolResult = await createErrorMessage(error);
  assert.equal(result.isError, true);
  assert.equal(
    result.content[0]?.text,
    '{"statusCode":500,"headers":{"content-type":"application/json"},"body":"{\\"message\\":\\"Internal Server Error\\"}"}'
  );
});

test('createErrorMessage handles error wrapped in response object', async () => {
  const error = {
    response: {
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: 'Not Found',
    },
  };

  const result: CallToolResult = await createErrorMessage(error);
  assert.equal(result.isError, true);
  assert.equal(result.content[0]?.type, 'text');
  assert.equal(
    result.content[0].text,
    '{"statusCode":404,"headers":{"content-type":"application/json"},"body":"Not Found"}'
  );
});

test('createErrorMessage handles native Error object', async () => {
  const error = new Error('Something went wrong');
  const result: CallToolResult = await createErrorMessage(error);
  assert.equal(result.content[0]?.text, 'Tool Error: Something went wrong');
});

test('createErrorMessage handles unknown object error', async () => {
  const error = { foo: 'bar' };
  const result: CallToolResult = await createErrorMessage(error);
  assert.equal(result.content[0]?.text, 'Tool Error: {"foo":"bar"}');
});

test('createErrorMessage handles non-object error (string)', async () => {
  const error = 'just a string error';
  const result: CallToolResult = await createErrorMessage(error);
  assert.equal(result.isError, true);
  assert.equal(result.content[0]?.type, 'text');
  assert.equal(result.content[0]?.text, 'Tool Error: "just a string error"');
});

test('createErrorMessage handles error with Blob body', async () => {
  const blob = new Blob([JSON.stringify({ msg: 'from blob' })], {
    type: 'application/json',
  });
  const error = { statusCode: 400, headers: {}, body: blob };
  const result: CallToolResult = await createErrorMessage(error);
  assert.equal(result.isError, true);
  assert.equal(result.content[0]?.type, 'text');
  assert.equal(
    result.content[0].text,
    '{"statusCode":400,"headers":{},"body":"eyJtc2ciOiJmcm9tIGJsb2IifQ=="}'
  );
});

test('createErrorMessage handles error with ReadableStream body', async () => {
  const stream = Readable.from(['streamed data']);
  const error = { statusCode: 502, headers: { 'x-test': 'yes' }, body: stream };
  const result: CallToolResult = await createErrorMessage(error);
  assert.equal(
    result.content[0]?.text,
    '{"statusCode":502,"headers":{"x-test":"yes"},"body":"streamed data"}'
  );
});

test('createErrorMessage handles error with empty headers', async () => {
  const error = { statusCode: 418, headers: {}, body: 'I\'m a teapot' };
  const result: CallToolResult = await createErrorMessage(error);
  assert.equal(
    result.content[0]?.text,
    `{"statusCode":418,"headers":{},"body":"I'm a teapot"}`
  );
});

test('createErrorMessage handles error with no headers defined', async () => {
  const error = { statusCode: 401, body: 'Unauthorized' };
  const result: CallToolResult = await createErrorMessage(error);
  assert.equal(
    result.content[0]?.text,
    '{"statusCode":401,"headers":{},"body":"Unauthorized"}'
  );
});

test('createErrorMessage handles response with status but no body', async () => {
  const error = { response: { statusCode: 503, headers: { foo: 'bar' } } };
  const result: CallToolResult = await createErrorMessage(error);
  assert.equal(
    result.content[0]?.text,
    'Tool Error: {"response":{"statusCode":503,"headers":{"foo":"bar"}}}'
  );
});
