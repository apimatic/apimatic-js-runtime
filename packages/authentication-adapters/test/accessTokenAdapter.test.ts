import { callHttpInterceptors } from '../../core/src/http/httpInterceptor';
import { accessTokenAuthenticationProvider } from '../src/accessTokenAdapter';
import { HttpRequest } from '../../core-interfaces/src/httpRequest';
import { HttpResponse } from '../../core-interfaces/src/httpResponse';

describe('test access token authentication scheme', () => {
  const config = {
    timeout: 60000,
    environment: 'Production',
    customUrl: 'https://connect.product.com',
    accessToken:
      'EAAAEFZnu3e-UrU0rgzD0RxbOBCEOYRGgAM1DcZq0B8IGl9iLutT-w8phqs3B8e2',
  };

  it('should test access token auth with enabled authentication', async () => {
    const response: HttpResponse = {
      statusCode: 200,
      body: 'testBody',
      headers: { 'test-header': 'test-value' },
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const authenticationProvider = accessTokenAuthenticationProvider(config);
    const handler = authenticationProvider(true);
    const interceptor = [handler];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toEqual({
      authorization:
        'Bearer EAAAEFZnu3e-UrU0rgzD0RxbOBCEOYRGgAM1DcZq0B8IGl9iLutT-w8phqs3B8e2',
    });
  });

  it('should test access token auth with disabled authentication', async () => {
    const response: HttpResponse = {
      statusCode: 200,
      body: 'testBody',
      headers: { 'test-header': 'test-value' },
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const authenticationProvider = accessTokenAuthenticationProvider(config);
    const handler = authenticationProvider(false);
    const interceptor = [handler];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toBeUndefined();
  });
});
