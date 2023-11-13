import { accessTokenAuthenticationProvider } from '../src/accessTokenAdapter';
import { basicAuthenticationProvider } from '../src/basicAuthenticationAdapter';
import { compositeAuthenticationProvider } from '../src/compositeAuthenticationAdapter';
import { customQueryAuthenticationProvider } from '../src/customQueryAuthenticationAdapter';
import { customHeaderAuthenticationProvider } from '../src/customHeaderAuthenticationAdapter';
import { callHttpInterceptors } from '../../core/src/http/httpInterceptor';
import { HttpRequest, HttpResponse } from '@apimatic/core-interfaces';

describe('test composite Authentication Adapter', () => {
  const config = {
    timeout: 60000,
    environment: 'Production',
    customUrl: 'https://connect.product.com',
    accessTokenCredentials: {
      accessToken: '0b79bab50daca910bmmmd4f1a2b675d606555e222',
    },
    basicAuthCredentials: {
      username: 'Maryam',
      password: '123456',
    },
    apiKeyCredentials: {
      token: 'asdqwaxr2gSdhasWSDbdAgdA623ffghhhde7Adysi23',
      apiKey: 'api-key',
    },
    apiHeaderCredentials: {
      token: 'Qaws2W233tuyess4T56G6Vref2',
      apiKey: 'api-key',
    },
    oAuthBearerTokenCredentials: {
      accessToken: '0b79bab50daca54cchg12k000d4f1a2b675d604257e42',
    },
  };

  const authConfig = {
    accessToken:
      config.accessTokenCredentials &&
      accessTokenAuthenticationProvider(config.accessTokenCredentials),
    basicAuth:
      config.basicAuthCredentials &&
      basicAuthenticationProvider(
        config.basicAuthCredentials.username,
        config.basicAuthCredentials.password
      ),
    apiKey:
      config.apiKeyCredentials &&
      customQueryAuthenticationProvider(config.apiKeyCredentials),
    apiHeader:
      config.apiHeaderCredentials &&
      customHeaderAuthenticationProvider(config.apiHeaderCredentials),
    oAuthBearerToken:
      config.oAuthBearerTokenCredentials &&
      accessTokenAuthenticationProvider(config.oAuthBearerTokenCredentials),
  };

  const response: HttpResponse = {
    statusCode: 200,
    body: 'testBody',
    headers: { 'test-header': 'test-value' },
  };

  it('should test OR scheme with enabled accessToken and enabled basicAuth', async () => {
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const securityRequirements = [{ accessToken: true }, { basicAuth: true }];
    const provider = compositeAuthenticationProvider(authConfig);
    const interceptor = [provider(securityRequirements)];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toEqual({
      authorization: 'Bearer 0b79bab50daca910bmmmd4f1a2b675d606555e222',
    });
    expect(context.request.auth).toEqual(undefined);
  });

  it('should test OR scheme with enabled accessToken and disabled basicAuth', async () => {
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const securityRequirements = [{ accessToken: true }, { basicAuth: false }];
    const provider = compositeAuthenticationProvider(authConfig);
    const interceptor = [provider(securityRequirements)];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toEqual({
      authorization: 'Bearer 0b79bab50daca910bmmmd4f1a2b675d606555e222',
    });
    expect(context.request.auth).toEqual(undefined);
  });

  it('should test OR scheme with disabled accessToken and enabled basicAuth', async () => {
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const securityRequirements = [{ accessToken: false }, { basicAuth: true }];
    const provider = compositeAuthenticationProvider(authConfig);
    const interceptor = [provider(securityRequirements)];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toEqual(undefined);
    expect(context.request.auth).toEqual({
      username: 'Maryam',
      password: '123456',
    });
  });

  it('should test OR scheme with disabled accessToken and disabled basicAuth', async () => {
    try {
      const request: HttpRequest = {
        method: 'GET',
        url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      };
      const securityRequirements = [
        { accessToken: false },
        { basicAuth: false },
      ];
      const provider = compositeAuthenticationProvider(authConfig);
      const interceptor = [provider(securityRequirements)];
      const client = async (req) => {
        return { request: req, response };
      };
      const executor = callHttpInterceptors(interceptor, client);
      const context = await executor(request, undefined);
      expect(context.request.headers).toEqual(undefined);
      expect(context.request.auth).toEqual(undefined);
    } catch (error) {
      expect(error.message).toEqual(
        'Required authentication credentials for this API call are not provided or all provided auth combinations are disabled'
      );
    }
  });

  it('should test AND scheme with disabled accessToken and enabled basicAuth', async () => {
    try {
      const request: HttpRequest = {
        method: 'GET',
        url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      };
      const securityRequirements = [{ accessToken: false, basicAuth: true }];
      const provider = compositeAuthenticationProvider(authConfig);
      const interceptor = [provider(securityRequirements)];
      const client = async (req) => {
        return { request: req, response };
      };
      const executor = callHttpInterceptors(interceptor, client);
      const context = await executor(request, undefined);
      expect(context.request.auth).toEqual({
        username: 'Maryam',
        password: '123456',
      });
    } catch (error) {
      expect(error.message).toEqual(
        'Required authentication credentials for this API call are not provided or all provided auth combinations are disabled'
      );
    }
  });

  it('should test AND scheme with enabled accessToken and enabled basicAuth', async () => {
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const securityRequirements = [{ accessToken: true, basicAuth: true }];
    const provider = compositeAuthenticationProvider(authConfig);
    const interceptor = [provider(securityRequirements)];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toEqual({
      authorization: 'Bearer 0b79bab50daca910bmmmd4f1a2b675d606555e222',
    });
    expect(context.request.auth).toEqual({
      username: 'Maryam',
      password: '123456',
    });
  });

  it('should test AND scheme with enabled accessToken and disabled basicAuth', async () => {
    try {
      const request: HttpRequest = {
        method: 'GET',
        url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      };
      const securityRequirements = [{ accessToken: true, basicAuth: false }];
      const provider = compositeAuthenticationProvider(authConfig);
      const interceptor = [provider(securityRequirements)];
      const client = async (req) => {
        return { request: req, response };
      };
      const executor = callHttpInterceptors(interceptor, client);
      const context = await executor(request, undefined);
      expect(context.request.headers).toEqual({
        authorization: 'Bearer 0b79bab50daca910bmmmd4f1a2b675d606555e222',
      });
    } catch (error) {
      expect(error.message).toEqual(
        'Required authentication credentials for this API call are not provided or all provided auth combinations are disabled'
      );
    }
  });

  it('should test scheme combination with enabled apiKey, basicAuth, apiHeader or enabled oAuthBearerToken', async () => {
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const securityRequirements = [
      { apiKey: true, basicAuth: true, apiHeader: true },
      { oAuthBearerToken: true },
    ];
    const provider = compositeAuthenticationProvider(authConfig);
    const interceptor = [provider(securityRequirements)];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toEqual({
      apiKey: 'api-key',
      token: 'Qaws2W233tuyess4T56G6Vref2',
    });
    expect(context.request.auth).toEqual({
      username: 'Maryam',
      password: '123456',
    });
    expect(context.request.url).toEqual(
      'http://apimatic.hopto.org:3000/test/requestBuilder?token=asdqwaxr2gSdhasWSDbdAgdA623ffghhhde7Adysi23&apiKey=api-key'
    );
  });

  it('should test scheme combination with disabled apiKey, basicAuth, apiHeader or enabled oAuthBearerToken', async () => {
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const securityRequirements = [
      { apiKey: true, basicAuth: false, apiHeader: true },
      { oAuthBearerToken: true },
    ];
    const provider = compositeAuthenticationProvider(authConfig);
    const interceptor = [provider(securityRequirements)];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toEqual({
      authorization: 'Bearer 0b79bab50daca54cchg12k000d4f1a2b675d604257e42',
    });
  });
});
