import { ApiError } from '../../src/errors/apiError';
import { HttpRequest } from '../../lib/http/httpRequest';
import { HttpResponse } from '../../lib/http/httpResponse';
describe('Test API Error Instance', () => {
  const deprecationSpy = jest.spyOn(console, 'warn');
  test.each([
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
      "Unexpected error: Could not parse HTTP response body as JSON. Unexpected ']'",
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
      "Unexpected error: Could not parse HTTP response body as JSON. Unexpected ']'",
    ],
  ])(
    '%s',
    (
      _: string,
      request: HttpRequest,
      response: HttpResponse,
      expectedResult: unknown,
      node_env: string,
      errorMessage?: string
    ) => {
      process.env.NODE_ENV = node_env;
      const apiError = new ApiError(
        { request, response },
        'Internal Server Error'
      );
      if (errorMessage !== undefined) {
        expect(deprecationSpy).toHaveBeenCalledWith(errorMessage);
      }
      expect(apiError.result).toEqual(expectedResult);
    }
  );
});
