import { OAuthToken } from './oAuthToken';
import {
  AuthenticatorInterface,
  passThroughInterceptor,
} from '@apimatic/core-interfaces';
import { AUTHORIZATION_HEADER, setHeader } from '@apimatic/http-headers';

export const requestAuthenticationProvider = (
  initialOAuthToken?: OAuthToken,
  oAuthTokenProvider?: (token: OAuthToken | undefined) => Promise<OAuthToken>,
  oAuthOnTokenUpdate?: (token: OAuthToken) => void
): AuthenticatorInterface<boolean> => {
  // This token is shared between all API calls for a client instance.
  let lastOAuthToken: Promise<OAuthToken | undefined> = Promise.resolve(
    initialOAuthToken
  );

  return (requiresAuth?: boolean) => {
    if (!requiresAuth) {
      return passThroughInterceptor;
    }

    return async (request, options, next) => {
      let oAuthToken = await lastOAuthToken;
      if (
        oAuthTokenProvider &&
        (!isValid(oAuthToken) || isExpired(oAuthToken))
      ) {
        // Set the shared token for the next API calls to use.
        lastOAuthToken = oAuthTokenProvider(oAuthToken);
        oAuthToken = await lastOAuthToken;
        if (oAuthOnTokenUpdate && oAuthToken) {
          oAuthOnTokenUpdate(oAuthToken);
        }
      }
      setOAuthTokenInRequest(oAuthToken, request);
      return next(request, options);
    };
  };
};

function setOAuthTokenInRequest(
  oAuthToken: OAuthToken | undefined,
  request: any
) {
  validateAuthorization(oAuthToken);
  request.headers = request.headers ?? {};
  setHeader(
    request.headers,
    AUTHORIZATION_HEADER,
    `Bearer ${oAuthToken?.accessToken}`
  );
}

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

function isValid(oAuthToken: OAuthToken | undefined): oAuthToken is OAuthToken {
  return typeof oAuthToken !== 'undefined';
}

function isExpired(oAuthToken: OAuthToken) {
  return (
    typeof oAuthToken.expiry !== 'undefined' &&
    oAuthToken.expiry < Date.now() / 1000
  );
}
