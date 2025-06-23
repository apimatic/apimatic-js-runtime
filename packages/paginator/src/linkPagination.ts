import { PaginationStrategy } from './paginationStrategy';
import { RequestBuilder } from '@apimatic/core/lib/http/requestBuilder';
import { PagedResponse } from './pagedResponse';
import { LinkPagedResponse } from './linkPagedResponse';
import { getValueByJsonPointer } from '@apimatic/core/lib/apiHelper';

export class LinkPagination implements PaginationStrategy {
  private readonly nextLinkPointer: string;
  private nextLinkValue: string | null = null;

  constructor(nextLinkPointer: string) {
    this.nextLinkPointer = nextLinkPointer;
  }

  public isApplicable(
    request: RequestBuilder<any, any>,
    response: PagedResponse<any, any> | null
  ): boolean {
    if (response === null) {
      this.nextLinkValue = null;
      return true;
    }

    const nextLink = getValueByJsonPointer(response, this.nextLinkPointer);
    if (nextLink == null) {
      return false;
    }
    this.nextLinkValue = nextLink;
    const queryParams = this.extractQueryParams(nextLink);

    for (const [key, value] of Object.entries(queryParams)) {
      request.query(key, value);
    }
    return true;
  }

  public withMetadata<TItem, TPage>(
    response: PagedResponse<TItem, TPage>
  ): LinkPagedResponse<TItem, TPage> {
    return {
      ...response,
      nextLink: this.nextLinkValue,
    };
  }

  private extractQueryParams = (link: string): Record<string, string> => {
    const result: Record<string, string> = {};

    const [, query] = link.split('?');

    const decodedEqualsQuery = decodeURIComponent(query);
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
