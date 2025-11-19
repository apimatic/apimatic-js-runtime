import { callHttpInterceptors } from '@apimatic/core';
import { noneAuthenticationProvider } from '../src/noAuthenticationAdapter';
import { HttpRequest, HttpResponse } from '@apimatic/core-interfaces';

describe('test access token authentication scheme', () => {
  const response: HttpResponse = {
    statusCode: 200,
    body: 'testBody',
    headers: { 'test-header': 'test-value' },
  };

  const request: HttpRequest = {
    method: 'GET',
    url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
  };

  it('should test access token auth with enabled authentication', async () => {
    const handler = noneAuthenticationProvider();
    const interceptor = [handler];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.auth).toBeUndefined();
    expect(context.request.headers).toBeUndefined();
    expect(context.request.url).toEqual(
      'http://apimatic.hopto.org:3000/test/requestBuilder'
    );
  });
});
