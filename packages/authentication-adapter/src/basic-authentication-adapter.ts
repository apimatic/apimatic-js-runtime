import {
  passThroughInterceptor,
  AuthenticatorInterface,
} from '@apimatic/core-interfaces';

/** None authentication provider */
export const noneAuthenticationProvider = () => passThroughInterceptor;

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
