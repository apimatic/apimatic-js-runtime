import { PaginationStrategy } from '../paginationStrategy';
import { PagedResponse } from '../pagedResponse';
import { LinkPagedResponse } from './linkPagedResponse';
import { getValueByJsonPointer, extractQueryParams } from '../utilities';
import { PagedDataState } from '../strategySelector';

export class LinkPagination implements PaginationStrategy {
  private readonly nextLinkPointer: string;
  private nextLinkValue: string | null = null;

  constructor(nextLinkPointer: string) {
    this.nextLinkPointer = nextLinkPointer;
  }

  public tryPreparingRequest<TItem, TPage, TRequest>(
    state: PagedDataState<TItem, TPage, TRequest>
  ): boolean {
    if (state.response === null) {
      this.nextLinkValue = null;
      return true;
    }

    const nextLink = getValueByJsonPointer(
      state.response,
      this.nextLinkPointer
    );
    if (nextLink == null) {
      return false;
    }
    this.nextLinkValue = nextLink;
    for (const [pointer, setter] of Object.entries(
      extractQueryParams(nextLink)
    )) {
      state.request = state.requestManager.updater(state.request)(
        pointer,
        setter
      );
    }
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
