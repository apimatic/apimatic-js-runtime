import { Pagination } from './pagination';
import { DefaultRequestBuilder } from '../http/requestBuilder';
import { PagedResponse } from './pagedResponse';
import { LinkPagedResponse } from './linkPagedResponse';
import { getValueByJsonPointer } from '../apiHelper';

export class LinkPagination<
  BaseUrlParamType,
  AuthParams,
  T,
  P
> extends Pagination<BaseUrlParamType, AuthParams, T, P> {
  private nextLinkPointer: string;
  private nextLinkValue: string | null = null;

  constructor(nextLinkPointer: string) {
    super();
    this.nextLinkPointer = nextLinkPointer;
  }

  public isApplicable(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    currentData: PagedResponse<any, any> | null
  ): boolean {
    if (currentData === null) {
      this.nextLinkValue = null;
      return true;
    }

    const nextLink = getValueByJsonPointer(currentData, this.nextLinkPointer);
    this.nextLinkValue = nextLink;
    if (nextLink == null) {
      return false;
    }
    const queryParams = this.extractQueryParams(nextLink);

    for (const [key, value] of Object.entries(queryParams)) {
      request.query(key, value);
    }
    return true;
  }

  public withMetadata(response: PagedResponse<T, P>): LinkPagedResponse<T, P> {
    return {
      ...response,
      nextLink: this.nextLinkValue,
    };
  }

  private extractQueryParams = (link: string): Record<string, string> => {
    const result: Record<string, string> = {};

    const [, query] = link.split('?');

    const decodedEqualsQuery = query.replace(/%3D/gi, '=');
    const queryParams = decodedEqualsQuery.split('&');

    for (const queryParam of queryParams) {
      const [key, value] = queryParam.split('=');
      if (key) {
        result[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }

    return result;
  };
}
