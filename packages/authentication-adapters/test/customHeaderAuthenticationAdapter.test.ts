import { callHttpInterceptors } from '../../core/src/http/httpInterceptor';
import { customHeaderAuthenticationProvider } from '../src/customHeaderAuthenticationAdapter';
import { HttpRequest } from '../../core-interfaces/src/httpRequest';
import { HttpResponse } from '../../core-interfaces/src/httpResponse';

describe('test custom header authentication scheme', () => {
  test.each([
    [
      'should test custom header auth with enabled authentication and empty request headers',
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
      'should test custom header auth with enabled authentication and existing request headers',
      true,
      {
        method: 'GET',
        url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
        headers: { 'test-header': 'test-value' },
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
      const headers = request.headers ?? {};
      const authenticationProvider = customHeaderAuthenticationProvider(
        authParams
      );
      const handler = authenticationProvider(enableAuthentication);
      const interceptor = [handler];
      const client = async (req: HttpRequest) => {
        return { request: req, response };
      };
      const executor = callHttpInterceptors(interceptor, client);
      const context = await executor(request, undefined);
      if (enableAuthentication) {
        if (Object.keys(headers).length !== 0) {
          expect(context.request.headers).toEqual({
            token: 'Qaws2W233WedeRe4T56G6Vref2',
            'test-header': 'test-value',
            'api-key': 'api-key',
          });
        } else {
          expect(context.request.headers).toEqual({
            token: 'Qaws2W233WedeRe4T56G6Vref2',
            'api-key': 'api-key',
          });
        }
      } else {
        expect(context.request.headers).toBeUndefined();
      }
    }
  );
});
