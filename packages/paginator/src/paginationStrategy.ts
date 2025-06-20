import { RequestBuilder } from '@apimatic/core/lib/http/requestBuilder';
import { PagedResponse } from './pagedResponse';

export interface PaginationStrategy {
  /**
   * Check if this strategy can be applied on given request.
   * Updates the request if its applicable.
   *
   * @param request The request object to be modify for current page's
   *                API call.
   * @param response The response of the last page.
   * @returns True if this strategy is applicable on the given request.
   */
  isApplicable(
    request: RequestBuilder<any, any>,
    response: PagedResponse<any, any> | null
  ): boolean;

  /**
   * Apply the metadata parameters to the response object.
   *
   * @param response The response of the current page to be modfied with
   *                 its metadata.
   */
  withMetadata<I, P>(response: PagedResponse<I, P>): PagedResponse<I, P>;
}
