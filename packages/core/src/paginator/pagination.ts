import { DefaultRequestBuilder } from '../http/requestBuilder';
import { PagedResponse } from './pagedResponse';

export abstract class Pagination<BaseUrlParamType, AuthParams, T, P> {
  /**
   * Abstract method to update the request before fetching the next page.
   * Must be implemented by subclasses.
   *
   * @param request - The request object to modify
   * @param currentData - The data in the current page
   * @returns A modified request object
   */
  public abstract isApplicable(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    currentData: PagedResponse<any, any> | null
  ): boolean;

  public abstract withMetadata(
    response: PagedResponse<T, P>
  ): PagedResponse<T, P>;
}
