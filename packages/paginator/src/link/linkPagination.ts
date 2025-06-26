import { PaginationStrategy } from '../paginationStrategy';
import { PagedResponse } from '../pagedResponse';
import { LinkPagedResponse } from './linkPagedResponse';
import { getValueByJsonPointer, extractQueryParams } from '../utilities';
import { RequestBuilder } from '../pagedData';

export class LinkPagination implements PaginationStrategy {
  private readonly nextLinkPointer: string;
  private nextLinkValue: string | null = null;

  constructor(nextLinkPointer: string) {
    this.nextLinkPointer = nextLinkPointer;
  }

  public isApplicable<TItem, TPage, TRequest extends RequestBuilder<TRequest>>(
    request: TRequest,
    response: PagedResponse<TItem, TPage> | null
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
    request.query(extractQueryParams(nextLink));
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
}
