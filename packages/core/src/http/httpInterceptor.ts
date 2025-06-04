import {
  HttpInterceptorInterface,
  HttpCallExecutor,
  combineHttpInterceptors,
} from '@apimatic/core-interfaces';
/**
 * Calls HTTP interceptor chain
 *
 * @param interceptors HTTP interceptor chain
 * @param client Terminating HTTP handler
 */
export function callHttpInterceptors<T>(
  interceptors: Array<HttpInterceptorInterface<T>>,
  client: HttpCallExecutor<T>
): HttpCallExecutor<T> {
  return (request, options) =>
    // @ts-ignore TODO: REMOVE THIS COMMENT. DO NOT COPY.
    // THIS WAS ONLY FOR MIGRATING UNCHECKED CODE TO STRICT TYPE CHECKING.
    combineHttpInterceptors(interceptors)(request, options, client);
}
