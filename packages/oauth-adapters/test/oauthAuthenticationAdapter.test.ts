import { callHttpInterceptors } from '../../core/src/http/httpInterceptor';
import { requestAuthenticationProvider } from '../src/oauthAuthenticationAdapter';
import {
  HttpContext,
  HttpRequest,
  HttpResponse,
} from '../../core-interfaces/src';
import { OAuthToken } from '../src/oAuthToken';

describe('test oauth request provider', () => {
  it('should test oauth request provider with enabled authentication', async () => {
    const response: HttpResponse = {
      statusCode: 200,
      body: 'testBody',
      headers: { 'test-header': 'test-value' },
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };

    const oAuthToken: OAuthToken = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiresIn: BigInt(100000),
      scope: '[products, orders]',
      expiry: BigInt(Date.now()),
    };
    const authenticationProvider = requestAuthenticationProvider(oAuthToken);
    let context: HttpContext = { request, response };
    const handler = authenticationProvider(true);
    const interceptor = [handler];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    context = await executor(request, undefined);
    return expect(context.request.headers).toEqual({
      authorization: 'Bearer 1f12495f1a1ad9066b51fb3b4e456aee',
    });
  });

  it('should test oauth request provider with disabled authentication', async () => {
    const response: HttpResponse = {
      statusCode: 200,
      body: 'testBody',
      headers: { 'test-header': 'test-value' },
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };

    const oAuthToken = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiresIn: BigInt(100000),
      scope: '[products, orders]',
      expiry: BigInt(Date.now()),
    };
    const authenticationProvider = requestAuthenticationProvider(oAuthToken);
    let context: HttpContext = { request, response };
    const handler = authenticationProvider(false);
    const interceptor = [handler];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    context = await executor(request, undefined);
    return expect(context.request.headers).toBeUndefined();
  });

  it('should test oauth request provider with enabled authentication and expired token', async () => {
    const response: HttpResponse = {
      statusCode: 200,
      body: 'testBody',
      headers: { 'test-header': 'test-value' },
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };

    const oAuthToken = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiresIn: BigInt(100000),
      scope: '[products, orders]',
      expiry: BigInt(2000),
    };
    try {
      const authenticationProvider = requestAuthenticationProvider(oAuthToken);
      const handler = authenticationProvider(true);
      const interceptor = [handler];
      const client = async (req) => {
        return { request: req, response };
      };
      const executor = callHttpInterceptors(interceptor, client);
      const context = await executor(request, undefined);
      expect(context.request.headers).toBeUndefined();
    } catch (error) {
      const { message } = error as Error;
      expect(message).toEqual(
        'OAuth token is expired. A valid token is needed to make API calls.'
      );
    }
  });

  it('should test oauth request provider with enabled authentication and undefined token', async () => {
    const response: HttpResponse = {
      statusCode: 200,
      body: 'testBody',
      headers: { 'test-header': 'test-value' },
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };

    try {
      const authenticationProvider = requestAuthenticationProvider();
      let context: HttpContext = { request, response };
      const handler = authenticationProvider(true);
      const interceptor = [handler];
      const client = async (req) => {
        return { request: req, response };
      };
      const executor = callHttpInterceptors(interceptor, client);
      context = await executor(request, undefined);
      expect(context.request.headers).toBeUndefined();
    } catch (error) {
      const { message } = error as Error;
      expect(message).toEqual(
        'Client is not authorized. An OAuth token is needed to make API calls.'
      );
    }
  });
});
