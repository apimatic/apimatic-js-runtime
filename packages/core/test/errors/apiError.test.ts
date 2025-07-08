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

    const mockHttpRequest = {
      method: 'GET',
      url: 'url',
      headers: { 'test-header': 'test-value' },
      body: { content: 'testBody', type: 'text' },
      responseType: 'text',
    } as HttpRequest;

    const mockStatusCode = 500;

    const baseResponse = {
      statusCode: mockStatusCode,
      headers: { 'test-header': 'test-value' },
    };

    test.each([
      [
        'should set properties correctly in constructor',
        mockHttpRequest,
        {
          ...baseResponse,
          body: '',
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'constructor',
      ],
      [
        'should parse valid JSON string body',
        mockHttpRequest,
        {
          ...baseResponse,
          body: '{"foo": "bar"}',
        } as HttpResponse,
        { foo: 'bar' },
        'production',
        undefined,
        'parse',
      ],
      [
        'should leave result undefined for empty string body',
        mockHttpRequest,
        {
          ...baseResponse,
          body: '',
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'should parse valid JSON from Readable stream body',
        mockHttpRequest,
        {
          ...baseResponse,
          body: stringToStream('{"a":1}'),
        } as HttpResponse,
        { a: 1 },
        'production',
        undefined,
        'parse',
      ],
      [
        'should leave result undefined for invalid JSON string body',
        mockHttpRequest,
        {
          ...baseResponse,
          body: '{invalid json}',
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'should leave result undefined for invalid JSON in Readable stream body',
        mockHttpRequest,
        {
          ...baseResponse,
          body: stringToStream('{invalid json}'),
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'should parse valid JSON from Blob body',
        mockHttpRequest,
        {
          ...baseResponse,
          body: stringToBlob('{"x":42}'),
        } as HttpResponse,
        { x: 42 },
        'production',
        undefined,
        'parse',
      ],
      [
        'should leave result undefined for invalid JSON in Blob body',
        mockHttpRequest,
        {
          ...baseResponse,
          body: stringToBlob('{invalid json}'),
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'should leave result undefined for empty Blob body',
        mockHttpRequest,
        {
          ...baseResponse,
          body: stringToBlob(''),
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'test with string in response body',
        mockHttpRequest,
        {
          ...baseResponse,
          body: '{"test-string" : "value"}',
        } as HttpResponse,
        { 'test-string': 'value' },
        'production',
        undefined,
        'parse',
      ],
      [
        'test with empty string in response body',
        mockHttpRequest,
        {
          ...baseResponse,
          body: '',
        } as HttpResponse,
        undefined,
        'production',
        undefined,
        'parse',
      ],
      [
        'test with incorrect json string in response body with test-environment',
        mockHttpRequest,
        {
          ...baseResponse,
          body: '[1, 2, 3, 4, ]',
        } as HttpResponse,
        undefined,
        'development',
        'Unexpected error: Could not parse HTTP response body. Unexpected \']\'',
        'parse',
      ],
      [
        'test with incorrect json string in response body with production environment',
        mockHttpRequest,
        {
          ...baseResponse,
          body: 'testBody result',
        } as HttpResponse,
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
