import { callHttpInterceptors } from '../../core/src/http/httpInterceptor';
import { customHeaderAuthenticationProvider } from '../src/customHeaderAuthenticationAdapter';
import { HttpRequest } from '../../core-interfaces/src/httpRequest';
import { HttpResponse } from '../../core-interfaces/src/httpResponse';

describe('test custom header authentication scheme', () => {
  test.each([
    [
      'should test custom header auth with enabled authentication',
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
      'should test custom header auth with disabled authentication',
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
      const authenticationProvider = customHeaderAuthenticationProvider(
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
        expect(context.request.headers).toEqual({
          token: 'Qaws2W233WedeRe4T56G6Vref2',
          'api-key': 'api-key',
        });
      } else {
        expect(context.request.headers).toBeUndefined();
      }
    }
  );
});
