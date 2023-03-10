import { callHttpInterceptors } from '../../core/src/http/httpInterceptor';
import { customQueryAuthenticationProvider } from '../src/customQueryAuthenticationAdapter';
import { HttpRequest } from '../../core-interfaces/src/httpRequest';
import { HttpResponse } from '../../core-interfaces/src/httpResponse';

describe('test custom query authentication scheme', () => {
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
      { token: 'Qaws2W233WedeRe4T56G6Vref2', 'api-key': 'api-key' },
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
      { token: 'Qaws2W233WedeRe4T56G6Vref2', 'api-key': 'api-key' },
    ],
  ])(
    '%s',
    async (
      _: string,
      enableAuthentication: boolean,
      request: HttpRequest,
      response: HttpResponse,
      authParams: Record<string, string>
    ) => {
      const authenticationProvider = customQueryAuthenticationProvider(
        authParams
      );
      const handler = authenticationProvider(enableAuthentication);
      const interceptor = [handler];
      const client = async (req) => {
        return { request: req, response };
      };
      const executor = callHttpInterceptors(interceptor, client);
      const context = await executor(request, undefined);
      if (enableAuthentication) {
        expect(context.request.url).toEqual(
          'http://apimatic.hopto.org:3000/test/requestBuilder?token=Qaws2W233WedeRe4T56G6Vref2&api-key=api-key'
        );
      } else {
        expect(context.request.url).toEqual(
          'http://apimatic.hopto.org:3000/test/requestBuilder'
        );
      }
    }
  );
});
