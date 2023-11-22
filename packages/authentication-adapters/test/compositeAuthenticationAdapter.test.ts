import { accessTokenAuthenticationProvider } from '../src/accessTokenAdapter';
import { basicAuthenticationProvider } from '../src/basicAuthenticationAdapter';
import { compositeAuthenticationProvider } from '../src/compositeAuthenticationAdapter';
import { customQueryAuthenticationProvider } from '../src/customQueryAuthenticationAdapter';
import { customHeaderAuthenticationProvider } from '../src/customHeaderAuthenticationAdapter';
import { callHttpInterceptors } from '../../core/src/http/httpInterceptor';
import { HttpRequest, HttpResponse } from '@apimatic/core-interfaces';
import { requestAuthenticationProvider } from '../../oauth-adapters/src/oauthAuthenticationAdapter';
import { OAuthToken } from '../../oauth-adapters/src/oAuthToken';

interface Configuration {
  basicAuthCredentials?: {
    username: string;
    password: string;
  };
  accessTokenCredentials?: {
    accessToken: string;
  };
  apiKeyCredentials?: {
    token: string;
    apiKey: string;
  };
  apiHeaderCredentials?: {
    token: string;
    apiKey: string;
  };
  oAuthBearerTokenCredentials?: {
    accessToken: string;
  };
  oAuthCCGCredentials?: {
    oAuthClientId: string;
    oAuthClientSecret: string;
    oAuthToken?: OAuthToken;
    oAuthScopes?: 'read' | 'write';
  };
  oAuthACGCredentials?: {
    oAuthClientId: string;
    oAuthClientSecret: string;
    oAuthRedirectUri: string;
    oAuthToken?: OAuthToken;
    oAuthScopes?: 'read' | 'write';
  };
  timeout: number;
  environment: 'Production' | 'Testing';
  customUrl: string;
}

describe('test composite authentication adapter with false or empty security requirements', () => {
  const config: Configuration = {
    timeout: 60000,
    environment: 'Production',
    customUrl: 'https://connect.product.com',
  };

  const authConfig = {
    apiKey:
      config.apiKeyCredentials &&
      customQueryAuthenticationProvider(config.apiKeyCredentials),
    apiHeader:
      config.apiHeaderCredentials &&
      customHeaderAuthenticationProvider(config.apiHeaderCredentials),
  };

  const response: HttpResponse = {
    statusCode: 200,
    body: 'testBody',
    headers: { 'test-header': 'test-value' },
  };

  it('should test false security requirements', async () => {
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const securityRequirements = false;
    const provider = compositeAuthenticationProvider(authConfig);
    const interceptor = [provider(securityRequirements)];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toEqual(undefined);
    expect(context.request.url).toEqual(
      'http://apimatic.hopto.org:3000/test/requestBuilder'
    );
  });

  it('should test empty security requirements', async () => {
    try {
      const request: HttpRequest = {
        method: 'GET',
        url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      };
      const securityRequirements = [];
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
});

describe('test composite authentication adapter with no credentials object provided', () => {
  const config: Configuration = {
    timeout: 60000,
    environment: 'Production',
    customUrl: 'https://connect.product.com',
  };

  const authConfig = {
    apiKey:
      config.apiKeyCredentials &&
      customQueryAuthenticationProvider(config.apiKeyCredentials),
    apiHeader:
      config.apiHeaderCredentials &&
      customHeaderAuthenticationProvider(config.apiHeaderCredentials),
  };

  const response: HttpResponse = {
    statusCode: 200,
    body: 'testBody',
    headers: { 'test-header': 'test-value' },
  };

  it('should test OR scheme with enabled custom query and enabled custom header', async () => {
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const securityRequirements = [{ apiKey: true }, { apiHeader: true }];
    const provider = compositeAuthenticationProvider(authConfig);
    const interceptor = [provider(securityRequirements)];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toEqual(undefined);
    expect(context.request.url).toEqual(
      'http://apimatic.hopto.org:3000/test/requestBuilder'
    );
  });

  it('should test OR scheme with disabled accessToken and disabled basicAuth', async () => {
    try {
      const request: HttpRequest = {
        method: 'GET',
        url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      };
      const securityRequirements = [{ apiKey: false }, { apiHeader: false }];
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
});

describe('test composite authentication adapter with security requirements combinations and provided authCredentials', () => {
  const config: Configuration = {
    timeout: 60000,
    environment: 'Production',
    customUrl: 'https://connect.product.com',
    accessTokenCredentials: {
      accessToken: '0b79bab50dacabmmmd4f1a2b675d606555e222',
    },
    basicAuthCredentials: {
      username: 'Maryam',
      password: '123456',
    },
    apiKeyCredentials: {
      token: 'asdqwaxr2gSdhasWSDbdA623ffghhhde7Adysi23',
      apiKey: 'api-key',
    },
    apiHeaderCredentials: {
      token: 'Qaws2W233tuyess6G6Vref2',
      apiKey: 'api-key',
    },
    oAuthBearerTokenCredentials: {
      accessToken: '0b79bab50daca54cchk000d4f1a2b675d604257e42',
    },
    oAuthCCGCredentials: {
      oAuthClientId: '23',
      oAuthClientSecret: 'tQNSqQlXBIwZcY9auoujQ57ckDcoh3t8UPbBRkSF',
    },
    oAuthACGCredentials: {
      oAuthClientId: '24',
      oAuthClientSecret: 'Y9auoujQ57ckDtQNSqQlXBIwZccoh3t8UPbBRkSF',
      oAuthRedirectUri: '',
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
    oAuthCCG:
      config.oAuthCCGCredentials &&
      requestAuthenticationProvider(config.oAuthCCGCredentials.oAuthToken),
    oAuthACG:
      config.oAuthACGCredentials &&
      requestAuthenticationProvider(config.oAuthACGCredentials.oAuthToken),
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
      authorization: 'Bearer 0b79bab50dacabmmmd4f1a2b675d606555e222',
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
      authorization: 'Bearer 0b79bab50dacabmmmd4f1a2b675d606555e222',
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
      authorization: 'Bearer 0b79bab50dacabmmmd4f1a2b675d606555e222',
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
        authorization: 'Bearer 0b79bab50dacabmmmd4f1a2b675d606555e222',
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
      token: 'Qaws2W233tuyess6G6Vref2',
    });
    expect(context.request.auth).toEqual({
      username: 'Maryam',
      password: '123456',
    });
    expect(context.request.url).toEqual(
      'http://apimatic.hopto.org:3000/test/requestBuilder?token=asdqwaxr2gSdhasWSDbdA623ffghhhde7Adysi23&apiKey=api-key'
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
      authorization: 'Bearer 0b79bab50daca54cchk000d4f1a2b675d604257e42',
    });
  });

  it('should test scheme combination with enabled oAuthACG oAuthCCG with unset access token', async () => {
    try {
      const request: HttpRequest = {
        method: 'GET',
        url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      };
      const securityRequirements = [{ oAuthACG: true, oAuthCCG: true }];
      const provider = compositeAuthenticationProvider(authConfig);
      const interceptor = [provider(securityRequirements)];
      const client = async (req) => {
        return { request: req, response };
      };
      const executor = callHttpInterceptors(interceptor, client);
      const context = await executor(request, undefined);
      expect(context.request.headers).toEqual({
        authorization: 'Bearer 0b79bab50daca54cchk000d4f1a2b675d604257e42',
      });
    } catch (error) {
      expect(error.message).toEqual(
        'Client is not authorized. An OAuth token is needed to make API calls.'
      );
    }
  });

  it('should test scheme combination with enabled oAuthACG oAuthCCG with set access token', async () => {
    if (config.oAuthACGCredentials) {
      config.oAuthACGCredentials.oAuthToken = {
        accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
        tokenType: 'Bearer',
        expiresIn: BigInt(100000),
        scope: '[products, orders]',
        expiry: BigInt(Date.now()),
      };
    }

    const auth1Config = {
      oAuthCCG:
        config.oAuthCCGCredentials &&
        requestAuthenticationProvider(config.oAuthCCGCredentials.oAuthToken),
      oAuthACG:
        config.oAuthACGCredentials &&
        requestAuthenticationProvider(config.oAuthACGCredentials.oAuthToken),
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
    };
    const securityRequirements = [{ oAuthACG: true }, { oAuthCCG: true }];
    const provider = compositeAuthenticationProvider(auth1Config);
    const interceptor = [provider(securityRequirements)];
    const client = async (req) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    const context = await executor(request, undefined);
    expect(context.request.headers).toEqual({
      authorization: 'Bearer 1f12495f1a1ad9066b51fb3b4e456aee',
    });
  });
});
