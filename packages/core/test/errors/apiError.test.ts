import { ApiError, loadResult } from '../../src/errors/apiError';
import { HttpRequest, HttpResponse } from '../../src/coreInterfaces';
import { convertToStream } from '@apimatic/convert-to-stream';

describe('ApiError Class', () => {
  describe('Test API Error Instance', () => {
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
      ['should parse valid JSON string body', '{"foo": "bar"}', { foo: 'bar' }],
      [
        'should parse valid JSON from Readable stream body',
        convertToStream('{"a":1}'),
        { a: 1 },
      ],
      ['should leave result undefined for empty string body', '', undefined],
      [
        'should leave result undefined for empty Readable stream body',
        convertToStream(''),
        undefined,
      ],
      [
        'should leave result undefined for invalid JSON string body',
        '{invalid json}',
        undefined,
      ],
      [
        'should leave result undefined for invalid JSON in Readable stream body',
        convertToStream('{invalid json}'),
        undefined,
      ],
    ])(
      '%s',
      async (
        name: string,
        body: string | NodeJS.ReadableStream | Blob,
        expectedResult: unknown
      ) => {
        const response = {
          ...baseResponse,
          body,
        } as HttpResponse;

        const apiError = new ApiError(
          { request: mockHttpRequest, response },
          name
        );

        await loadResult(apiError);
        expect(apiError.result).toEqual(expectedResult);
      }
    );
  });
});
