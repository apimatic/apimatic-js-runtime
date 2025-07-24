import { ApiError, loadResult } from '../../src/errors/apiError';
import { HttpRequest, HttpResponse } from '../../src/coreInterfaces';
import { convertToStream } from '@apimatic/convert-to-stream';

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

    const baseResponse = {
      statusCode: 500,
      headers: { 'test-header': 'test-value' },
    };

    it('should set properties correctly in constructor', () => {
      const response = {
        ...baseResponse,
        body: '',
      } as HttpResponse;

      const apiError = new ApiError(
        { request: mockHttpRequest, response },
        'Internal Server Error'
      );

      expect(apiError.request).toBe(mockHttpRequest);
      expect(apiError.statusCode).toBe(response.statusCode);
      expect(apiError.headers).toEqual(response.headers);
      expect(apiError.body).toBe(response.body);
      expect(apiError.message).toBe('Internal Server Error');
      expect(apiError.result).toBeUndefined();
    });

    test.each([
      [
        'should parse valid JSON string body',
        '{"foo": "bar"}',
        { foo: 'bar' },
        'production',
        undefined,
      ],
      [
        'should leave result undefined for empty string body',
        '',
        undefined,
        'production',
        undefined,
      ],
      [
        'should parse valid JSON from Readable stream body',
        convertToStream('{"a":1}'),
        { a: 1 },
        'production',
        undefined,
      ],
      [
        'should leave result undefined for invalid JSON string body',
        '{invalid json}',
        undefined,
        'production',
        undefined,
      ],
      [
        'should leave result undefined for invalid JSON in Readable stream body',
        convertToStream('{invalid json}'),
        undefined,
        'production',
        undefined,
      ],
      [
        'test with string in response body',
        '{"test-string" : "value"}',
        { 'test-string': 'value' },
        'production',
        undefined,
      ],
      [
        'test with empty string in response body',
        '',
        undefined,
        'production',
        undefined,
      ],
      [
        'test with incorrect json string in response body with test-environment',
        '[1, 2, 3, 4, ]',
        undefined,
        'development',
        `Unexpected error: Could not parse HTTP response body. Unexpected ']'`,
      ],
      [
        'test with incorrect json string in response body with production environment',
        'testBody result',
        undefined,
        'production',
        `Unexpected error: Could not parse HTTP response body. Unexpected ']'`,
      ],
    ])(
      '%s',
      async (
        _: string,
        body: string | NodeJS.ReadableStream | Blob,
        expectedResult: unknown,
        node_env?: string,
        errorMessage?: string
      ) => {
        process.env.NODE_ENV = node_env;
        const response = {
          ...baseResponse,
          body,
        } as HttpResponse;

        const apiError = new ApiError(
          { request: mockHttpRequest, response },
          'Internal server Error'
        );

        await loadResult(apiError);
        if (errorMessage !== undefined) {
          expect(deprecationSpy).toHaveBeenCalledWith(errorMessage);
        }
        expect(apiError.result).toEqual(expectedResult);
      }
    );
  });
});
