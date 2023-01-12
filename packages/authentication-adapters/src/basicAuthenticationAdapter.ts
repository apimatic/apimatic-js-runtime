import {
  AuthenticatorInterface,
  passThroughInterceptor,
} from '@apimatic/core-interfaces';

export const basicAuthAuthenticationProvider = ({
  basicAuthUserName,
  basicAuthPassword,
}: {
  basicAuthUserName: string;
  basicAuthPassword: string;
}): AuthenticatorInterface<boolean> => {
  return (requiresAuth?: boolean) => {
    if (!requiresAuth) {
      return passThroughInterceptor;
    }

    return (request, options, next) => {
      request.auth = {
        username: basicAuthUserName,
        password: basicAuthPassword,
      };

      return next(request, options);
    };
  };
};
