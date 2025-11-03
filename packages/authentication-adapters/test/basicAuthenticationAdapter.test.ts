import { callHttpInterceptors } from '@apimatic/core';
import { basicAuthenticationProvider } from '../src/basicAuthenticationAdapter';
import { HttpRequest, HttpResponse } from '@apimatic/core';

describe('test basic authentication scheme', () => {
  const config = {
    timeout: 60000,
    environment: 'Production',
    customUrl: 'https://connect.product.com',
    basicAuthUserName: 'maryam',
    basicAuthPassword: '12345678',
  };

  test.each([
    [
      'should test basic auth with enabled authentication',
      true,
      {
        method: 'GET',
        url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      } as HttpRequest,
      {
        statusCode: 200,
        body: 'testBody',
        headers: { 'test-header': 'test-value' },
      } as HttpResponse,
      'maryam',
      '12345678',
    ],
    [
      'should test basic auth with disabled authentication',
      false,
      {
        method: 'GET',
        url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      } as HttpRequest,
      {
        statusCode: 200,
        body: 'testBody',
        headers: { 'test-header': 'test-value' },
      } as HttpResponse,
      undefined,
      undefined,
    ],
  ])(
    '%s',
    async (
      _: string,
      enableAuthentication: boolean,
      request: HttpRequest,
      response: HttpResponse,
      token: string | undefined,
      apiKey: string | undefined
    ) => {
      const authenticationProvider = basicAuthenticationProvider(
        config.basicAuthUserName,
        config.basicAuthPassword
      );
      const handler = authenticationProvider(enableAuthentication);
      const interceptor = [handler];
      const client = async (req) => {
        return { request: req, response };
      };
      const executor = callHttpInterceptors(interceptor, client);
      const context = await executor(request, undefined);
      if (token === undefined || apiKey === undefined) {
        expect(context.request.auth).toBeUndefined();
      } else {
        expect(context.request.auth).toEqual({
          username: 'maryam',
          password: '12345678',
        });
      }
    }
  );
});
