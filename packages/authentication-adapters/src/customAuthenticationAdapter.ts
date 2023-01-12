import {
  AuthenticatorInterface,
  passThroughInterceptor,
} from '@apimatic/core-interfaces';

export const customAuthenticationProvider = ({}: {}): AuthenticatorInterface<boolean> => {
  return (requiresAuth?: boolean) => {
    if (!requiresAuth) {
      return passThroughInterceptor;
    }

    return (request, options, next) => {
      return next(request, options);
    };
  };
};
