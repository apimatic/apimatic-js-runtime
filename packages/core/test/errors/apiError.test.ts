import { ApiError } from '../../src/errors/apiError';
import { HttpRequest, HttpResponse } from '../../src/coreInterfaces';
import { Readable } from 'stream';

function stringToStream(str: string) {
  const stream = new Readable();
  stream.push(str);
  stream.push(null);
  return stream;
}

function stringToBlob(str: string, type = 'application/json') {
  return new Blob([str], { type });
}

describe('ApiError Class', () => {
  describe('Test API Error Instance', () => {
    const deprecationSpy = jest.spyOn(console, 'warn');
    test.each([
      [
        'should set properties correctly in constructor',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: { content: 'testBody', type: 'text' },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: '',
          headers: { 'test-header': 'test-value' },
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'constructor',
      ],
      [
        'should parse valid JSON string body',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: { content: 'testBody', type: 'text' },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: '{"foo": "bar"}',
          headers: { 'test-header': 'test-value' },
        } as HttpResponse,
        { foo: 'bar' },
        'production',
        undefined,
        'parse',
      ],
      [
        'should leave result undefined for empty string body',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: { content: 'testBody', type: 'text' },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: '',
          headers: { 'test-header': 'test-value' },
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'should parse valid JSON from Readable stream body',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: { content: 'testBody', type: 'text' },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: stringToStream('{"a":1}'),
          headers: { 'test-header': 'test-value' },
        } as HttpResponse,
        { a: 1 },
        'production',
        undefined,
        'parse',
      ],
      [
        'should leave result undefined for invalid JSON string body',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: { content: 'testBody', type: 'text' },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: '{invalid json}',
          headers: { 'test-header': 'test-value' },
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'should leave result undefined for invalid JSON in Readable stream body',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: { content: 'testBody', type: 'text' },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: stringToStream('{invalid json}'),
          headers: { 'test-header': 'test-value' },
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'should parse valid JSON from Blob body',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: { content: 'testBody', type: 'text' },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: stringToBlob('{"x":42}'),
          headers: { 'test-header': 'test-value' },
        } as HttpResponse,
        { x: 42 },
        'production',
        undefined,
        'parse',
      ],
      [
        'should leave result undefined for invalid JSON in Blob body',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: { content: 'testBody', type: 'text' },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: stringToBlob('{invalid json}'),
          headers: { 'test-header': 'test-value' },
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'should leave result undefined for empty Blob body',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: { content: 'testBody', type: 'text' },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: stringToBlob(''),
          headers: { 'test-header': 'test-value' },
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'test with string in response body',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: {
            content: 'testBody',
            type: 'text',
          },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: '{"test-string" : "value"}',
          headers: { 'test-header': 'test-value' },
        },
        { 'test-string': 'value' },
        'production',
        undefined,
        'parse',
      ],
      [
        'test with empty string in response body',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: {
            content: 'testBody',
            type: 'text',
          },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: '',
          headers: { 'test-header': 'test-value' },
        },
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'test with incorrect json string in response body with test-environment',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: {
            content: 'testBody',
            type: 'text',
          },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: '[1, 2, 3, 4, ]',
          headers: { 'test-header': 'test-value' },
        } as HttpResponse,
        undefined,
        'development',
        'Unexpected error: Could not parse HTTP response body. Unexpected \']\'',
        'parse',
      ],
      [
        'test with incorrect json string in response body with production environment',
        {
          method: 'GET',
          url: 'url',
          headers: { 'test-header': 'test-value' },
          body: {
            content: 'testBody',
            type: 'text',
          },
          responseType: 'text',
          auth: { username: 'test-username', password: 'test-password' },
        } as HttpRequest,
        {
          statusCode: 500,
          body: 'testBody result',
          headers: { 'test-header': 'test-value' },
        },
        undefined,
        'production',
        'Unexpected error: Could not parse HTTP response body. Unexpected \']\'',
        'parse',
      ],
    ])(
      '%s',
      async (
        _: string,
        request: HttpRequest,
        response: HttpResponse,
        expectedResult: unknown,
        node_env: string,
        errorMessage?: string,
        testType?: string
      ) => {
        process.env.NODE_ENV = node_env;
        const apiError = new ApiError(
          { request, response },
          'Internal Server Error'
        );

        if (testType === 'constructor') {
          expect(apiError.request).toBe(request);
          expect(apiError.statusCode).toBe(response.statusCode);
          expect(apiError.headers).toEqual(response.headers);
          expect(apiError.body).toBe(response.body);
          expect(apiError.message).toBe('Internal Server Error');
          expect(apiError.result).toBeUndefined();
        } else {
          await apiError.setResult();
          if (errorMessage !== undefined) {
            expect(deprecationSpy).toHaveBeenCalledWith(errorMessage);
          }
          expect(apiError.result).toEqual(expectedResult);
        }
      }
    );
  });
});
