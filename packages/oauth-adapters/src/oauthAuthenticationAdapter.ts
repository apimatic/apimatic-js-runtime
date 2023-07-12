import { OAuthToken } from './oAuthToken';
import {
  AuthenticatorInterface,
  passThroughInterceptor,
} from '@apimatic/core-interfaces';
import { AUTHORIZATION_HEADER, setHeader } from '@apimatic/http-headers';

export const requestAuthenticationProvider = (
  oAuthToken?: OAuthToken
): AuthenticatorInterface<boolean> => {
  return (requiresAuth?: boolean) => {
    if (!requiresAuth) {
      return passThroughInterceptor;
    }

    validateAuthorization(oAuthToken);
    return createRequestInterceptor(oAuthToken);
  };
};

function validateAuthorization(oAuthToken?: OAuthToken) {
  if (!isValid(oAuthToken)) {
    throw new Error(
      'Client is not authorized. An OAuth token is needed to make API calls.'
    );
  }

  if (isExpired(oAuthToken)) {
    throw new Error(
      'OAuth token is expired. A valid token is needed to make API calls.'
    );
  }
}

function createRequestInterceptor(oAuthToken?: OAuthToken) {
  return (request: any, options: any, next: any) => {
    request.headers = request.headers ?? {};
    setHeader(
      request.headers,
      AUTHORIZATION_HEADER,
      `Bearer ${oAuthToken?.accessToken}`
    );

    return next(request, options);
  };
}

function isValid(oAuthToken: OAuthToken | undefined): oAuthToken is OAuthToken {
  return typeof oAuthToken !== 'undefined';
}

function isExpired(oAuthToken: OAuthToken) {
  return (
    typeof oAuthToken.expiry !== 'undefined' &&
    oAuthToken.expiry < Date.now() / 1000
  );
}
