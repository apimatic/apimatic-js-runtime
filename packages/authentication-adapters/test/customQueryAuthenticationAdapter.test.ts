import { callHttpInterceptors } from '../../core/src/http/httpInterceptor';
import { customQueryAuthenticationProvider } from '../src/customQueryAuthenticationAdapter';
import { HttpRequest } from '../../core-interfaces/src/httpRequest';
import { HttpResponse } from '../../core-interfaces/src/httpResponse';

describe('test custom query authentication scheme', () => {
  const config = {
    timeout: 60000,
    environment: 'Production',
    customUrl: 'https://connect.product.com',
    token: 'Qaws2W233WedeRe4T56G6Vref2',
    apiKey: 'api-key',
  };

  test.each([
    [
      'should test custom query auth with enabled authentication',
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
      'Qaws2W233WedeRe4T56G6Vref2',
      'api-key',
    ],
    [
      'should test custom query auth with disabled authentication',
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
      const authenticationProvider = customQueryAuthenticationProvider(config);
      const handler = authenticationProvider(enableAuthentication);
      const interceptor = [handler];
      const client = async (req) => {
        return { request: req, response };
      };
      const executor = callHttpInterceptors(interceptor, client);
      const context = await executor(request, undefined);
      if (token === undefined || apiKey === undefined) {
        expect(context.request.url).toEqual(
          'http://apimatic.hopto.org:3000/test/requestBuilder'
        );
      } else {
        expect(context.request.url).toEqual(
          'http://apimatic.hopto.org:3000/test/requestBuilder?token=Qaws2W233WedeRe4T56G6Vref2&api-key=api-key'
        );
      }
    }
  );
});
