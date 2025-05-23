import { callHttpInterceptors } from '../../core/src';
import {
  isExpired,
  isValid,
  requestAuthenticationProvider,
  OAuthConfiguration,
} from '../src';
import {
  HttpContext,
  HttpInterceptorInterface,
  HttpRequest,
  HttpResponse,
  RequestOptions,
} from '../../core-interfaces/src';

describe('test oauth request provider', () => {
  it('should pass with disabled authentication', async () => {
    const oAuthToken = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiresIn: BigInt(100000),
      scope: 'products orders',
      expiry: BigInt(Date.now()),
    };
    const authenticationProvider = requestAuthenticationProvider(oAuthToken);
    return await executeAndExpect(authenticationProvider(false), undefined);
  });

  it('should pass with valid token', async () => {
    const oAuthToken = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiresIn: BigInt(100000),
      scope: 'products orders',
      expiry: BigInt(Date.now()),
    };
    const authenticationProvider = requestAuthenticationProvider(oAuthToken);
    return await executeAndExpect(authenticationProvider(true), {
      authorization: 'Bearer 1f12495f1a1ad9066b51fb3b4e456aee',
    });
  });

  it('should pass with valid token + authProvider + updateCallback', async () => {
    const oAuthToken = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiresIn: BigInt(100000),
      scope: 'products orders',
      expiry: BigInt(Date.now()),
    };
    const oAuthTokenProvider = jest.fn((_) => {
      return Promise.resolve({
        accessToken: 'Invalid',
        tokenType: 'Bearer',
      });
    });
    const oAuthOnTokenUpdate = jest.fn((_) => {
      // handler for updated token
    });
    const authenticationProvider = requestAuthenticationProvider(
      oAuthToken,
      oAuthTokenProvider,
      oAuthOnTokenUpdate
    );
    await executeAndExpect(authenticationProvider(true), {
      authorization: 'Bearer 1f12495f1a1ad9066b51fb3b4e456aee',
    });
    expect(oAuthTokenProvider.mock.calls).toHaveLength(0);
    expect(oAuthOnTokenUpdate.mock.calls).toHaveLength(0);
  });

  it('should fail with undefined token', async () => {
    const authenticationProvider = requestAuthenticationProvider();
    return await executeAndExpect(
      authenticationProvider(true),
      undefined,
      'Client is not authorized. An OAuth token is needed to make API calls.'
    );
  });

  it('should pass with undefined token + authProvider + updateCallback', async () => {
    const oAuthTokenProvider = jest.fn((token) => {
      if (token === undefined) {
        return Promise.resolve({
          accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
          tokenType: 'Bearer',
          expiresIn: BigInt(100000),
          scope: 'products orders',
          expiry: BigInt(Date.now()),
        });
      }
      // return an invalid token if existing token is not undefined
      return Promise.resolve({
        ...token,
        accessToken: 'Invalid',
      });
    });
    const oAuthOnTokenUpdate = jest.fn((_) => {
      // handler for updated token
    });
    const authenticationProvider = requestAuthenticationProvider(
      undefined,
      oAuthTokenProvider,
      oAuthOnTokenUpdate
    );
    await executeAndExpect(authenticationProvider(true), {
      authorization: 'Bearer 1f12495f1a1ad9066b51fb3b4e456aee',
    });
    expect(oAuthTokenProvider.mock.calls).toHaveLength(1);
    expect(oAuthTokenProvider.mock.calls[0][0]).toBe(undefined);
    expect(oAuthOnTokenUpdate.mock.calls).toHaveLength(1);
    expect(oAuthOnTokenUpdate.mock.calls[0][0].accessToken).toBe(
      '1f12495f1a1ad9066b51fb3b4e456aee'
    );
  });

  it('should fail with expired token', async () => {
    const oAuthToken = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiresIn: BigInt(100000),
      scope: 'products orders',
      expiry: BigInt(2000),
    };
    const authenticationProvider = requestAuthenticationProvider(oAuthToken);
    return await executeAndExpect(
      authenticationProvider(true),
      undefined,
      'OAuth token is expired. A valid token is needed to make API calls.'
    );
  });

  it('should pass with expired token + authProvider + updateCallback', async () => {
    const oAuthToken = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiresIn: BigInt(100000),
      scope: 'products orders',
      expiry: BigInt(2000),
    };
    const oAuthTokenProvider = jest.fn((token) => {
      if (token === undefined) {
        // return an invalid token if existing token is undefined
        return Promise.resolve({
          accessToken: 'Invalid',
          tokenType: 'Bearer',
        });
      }
      return Promise.resolve({
        ...token,
        accessToken: '1f12495f1a1ad9066b51fb3b4e456aeeNEW',
        expiry: BigInt(Date.now()),
      });
    });
    const oAuthOnTokenUpdate = jest.fn((_) => {
      // handler for updated token
    });

    const authenticationProvider = requestAuthenticationProvider(
      oAuthToken,
      oAuthTokenProvider,
      oAuthOnTokenUpdate
    );
    await executeAndExpect(authenticationProvider(true), {
      authorization: 'Bearer 1f12495f1a1ad9066b51fb3b4e456aeeNEW',
    });
    expect(oAuthTokenProvider.mock.calls).toHaveLength(1);
    expect(oAuthTokenProvider.mock.calls[0][0]?.accessToken).toBe(
      '1f12495f1a1ad9066b51fb3b4e456aee'
    );
    expect(oAuthOnTokenUpdate.mock.calls).toHaveLength(1);
    expect(oAuthOnTokenUpdate.mock.calls[0][0].accessToken).toBe(
      '1f12495f1a1ad9066b51fb3b4e456aeeNEW'
    );
  });
});

describe('isValid', () => {
  it('should return false if oAuthToken is undefined', () => {
    const token = undefined;
    expect(isValid(token)).toBe(false);
  });

  it('should return true if oAuthToken is defined', () => {
    const token = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiry: BigInt(Math.floor(Date.now() / 1000) + 60),
    };
    expect(isValid(token)).toBe(true);
  });

  it('should return true if oAuthToken is defined with no expiry', () => {
    const token = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
    };
    expect(isValid(token)).toBe(true);
  });
});

describe('isExpired', () => {
  it('should return false if expiry is undefined', () => {
    const token = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiry: undefined,
    };
    expect(isExpired(token)).toBe(false);
  });

  it('should return false if token is not expired', () => {
    const token = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiry: BigInt(Math.floor(Date.now() / 1000) + 60),
    }; // Expires in 60 seconds
    expect(isExpired(token)).toBe(false);
  });

  it('should return true if token is expired', () => {
    const token = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiry: BigInt(Math.floor(Date.now() / 1000) - 60),
    }; // Expired 60 seconds ago
    expect(isExpired(token)).toBe(true);
  });

  it('should correctly apply clock skew and return true if token is close to expiry', () => {
    const token = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      expiry: BigInt(Math.floor(Date.now() / 1000) + 30),
    }; // Expires in 30 seconds
    expect(isExpired(token, 0)).toBe(false); // No clock skew
    expect(isExpired(token, 40)).toBe(true); // Applying 40 seconds clock skew
  });

  it('should pass with non expired token + authProvider + updateCallback', async () => {
    const oneMinOffset: number = 60;
    const oAuthToken = {
      accessToken: '1f12495f1a1ad9066b51fb3b4e456aee',
      tokenType: 'Bearer',
      scope: 'products orders',
      expiry: BigInt(Date.now() + oneMinOffset) / BigInt(1000),
    };
    const oAuthConfiguration: OAuthConfiguration = {
      clockSkew: oneMinOffset * 2,
    };
    const oAuthTokenProvider = jest.fn((token) => {
      if (token === undefined) {
        // return an invalid token if existing token is undefined
        return Promise.resolve({
          accessToken: 'Invalid',
          tokenType: 'Bearer',
        });
      }
      return Promise.resolve({
        ...token,
        accessToken: '1f12495f1a1ad9066b51fb3b4e456aeeNEW',
        expiry: BigInt(Date.now()),
      });
    });
    const oAuthOnTokenUpdate = jest.fn((_) => {
      // handler for updated token
    });

    const authenticationProvider = requestAuthenticationProvider(
      oAuthToken,
      oAuthTokenProvider,
      oAuthOnTokenUpdate,
      oAuthConfiguration
    );
    await executeAndExpect(authenticationProvider(true), {
      authorization: 'Bearer 1f12495f1a1ad9066b51fb3b4e456aeeNEW',
    });
    expect(oAuthTokenProvider.mock.calls).toHaveLength(1);
    expect(oAuthTokenProvider.mock.calls[0][0]?.accessToken).toBe(
      '1f12495f1a1ad9066b51fb3b4e456aee'
    );
    expect(oAuthOnTokenUpdate.mock.calls).toHaveLength(1);
    expect(oAuthOnTokenUpdate.mock.calls[0][0].accessToken).toBe(
      '1f12495f1a1ad9066b51fb3b4e456aeeNEW'
    );
  });
});

describe('oauthAuthenticationAdapter', () => {
  it('calls custom setOAuthHeader and skips default header', async () => {
    const token = {
      accessToken: 'token',
      expiry: BigInt(Math.floor(Date.now() / 1000) + 1000),
    };
    const setOAuthHeader = jest.fn((request, t) => {
      request.headers['X-Test'] = t.accessToken;
    });

    const provider = requestAuthenticationProvider(
      token,
      undefined,
      undefined,
      undefined,
      setOAuthHeader
    );
    const interceptor = provider(true);
    const req: any = { headers: {} };
    await interceptor(req, {}, async () => ({
      request: req,
      response: { statusCode: 200, body: '', headers: {} },
    }));
    expect(setOAuthHeader).toHaveBeenCalled();
    expect(req.headers['X-Test']).toBe('token');
    expect(req.headers.Authorization).toBeUndefined();
  });

  it('subtracts clockSkew from expiry in isExpired', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = { accessToken: 't', expiry: BigInt(now + 10) };
    expect(isExpired(token, 0)).toBe(false);
    expect(isExpired(token, 20)).toBe(true);
  });
});

async function executeAndExpect(
  authenticationProvider: HttpInterceptorInterface<RequestOptions | undefined>,
  headers: Record<string, string> | undefined,
  errorMessage?: string
) {
  const response: HttpResponse = {
    statusCode: 200,
    body: 'testBody',
    headers: { 'test-header': 'test-value' },
  };

  const request: HttpRequest = {
    method: 'GET',
    url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
  };
  let context: HttpContext = { request, response };
  try {
    const interceptor = [authenticationProvider];
    const client = async (req: any) => {
      return { request: req, response };
    };
    const executor = callHttpInterceptors(interceptor, client);
    context = await executor(request, undefined);
    expect(context.request.headers).toEqual(headers);
  } catch (error) {
    expect(errorMessage === undefined).toBe(false);
    const { message } = error as Error;
    expect(message).toEqual(errorMessage);
  }
}
