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
        false,
      ],
      [
        'should parse valid JSON from Readable stream body',
        convertToStream('{"a":1}'),
        { a: 1 },
        'production',
        undefined,
        false,
      ],
      [
        'should leave result undefined for empty string body',
        '',
        undefined,
        'production',
        undefined,
        false,
      ],
      [
        'should leave result undefined for empty Readable stream body',
        convertToStream(''),
        undefined,
        'production',
        undefined,
        true,
      ],
      [
        'should leave result undefined for invalid JSON string body',
        '{invalid json}',
        undefined,
        'production',
        undefined,
        false,
      ],
      [
        'should leave result undefined for invalid JSON in Readable stream body',
        convertToStream('{invalid json}'),
        undefined,
        'production',
        undefined,
        false,
      ],
      [
        'test with incorrect json string in response body with production environment',
        'testBody result',
        undefined,
        'production',
        undefined,
        false,
      ],
      [
        'test with incorrect json string in response body with test-environment',
        '[1, 2, 3, 4, ]',
        undefined,
        'development',
        `Unexpected error: Could not parse HTTP response body. Unexpected ']'`,
        false,
      ],
    ])(
      '%s',
      async (
        _: string,
        body: string | NodeJS.ReadableStream | Blob,
        expectedResult: unknown,
        node_env?: string,
        errorMessage?: string,
        isBodyAlreadyRead?: boolean
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
        const isStreamRead = await isAlreadyRead(apiError.body);

        expect(isStreamRead).toBe(isBodyAlreadyRead);
        expect(apiError.result).toEqual(expectedResult);
        if (errorMessage) {
          expect(deprecationSpy).toHaveBeenCalledWith(errorMessage);
        }
      }
    );

    async function isAlreadyRead(
      input: string | Blob | NodeJS.ReadableStream
    ): Promise<boolean> {
      if (input instanceof Blob || typeof input === 'string') {
        return false; // Blob and string is always readable
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of input) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return chunks.length === 0;
    }
  });
});
