import { PaginationStrategy } from '../paginationStrategy';
import { PagedResponse } from '../pagedResponse';
import { LinkPagedResponse } from './linkPagedResponse';
import { getValueByJsonPointer, extractQueryParams } from '../utilities';
import { Request } from '../request';

export class LinkPagination implements PaginationStrategy {
  private readonly nextLinkPointer: string;
  private nextLinkValue: string | null = null;

  constructor(nextLinkPointer: string) {
    this.nextLinkPointer = nextLinkPointer;
  }

  public tryPreparingRequest<TItem, TPage>(
    request: Request,
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
    request.queryParams = {
      ...request.queryParams,
      ...extractQueryParams(nextLink),
    };
    return true;
  }

  public applyMetaData<TItem, TPage>(
    response: PagedResponse<TItem, TPage>
  ): LinkPagedResponse<TItem, TPage> {
    return {
      ...response,
      nextLink: this.nextLinkValue,
    };
  }
}
