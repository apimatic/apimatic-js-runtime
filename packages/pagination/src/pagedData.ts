import { ApiResponse, PagedAsyncIterable } from './coreInterfaces';
import { PaginationStrategy } from './paginationStrategy';
import { PagedDataState, StrategySelector } from './strategySelector';
import { PagedResponse } from './pagedResponse';
import { RequestManager } from './request';

export class PagedData<TItem, TPage, TRequest, TPagedResponse>
  implements PagedAsyncIterable<TItem, TPagedResponse> {
  private readonly paginationStrategies: PaginationStrategy[];
  constructor(
    private readonly requestManager: RequestManager<TRequest, TPage>,
    private readonly pagedResponseCreator: (
      p: PagedResponse<TItem, TPage> | null
    ) => TPagedResponse,
    private readonly itemsCreator: (
      response: ApiResponse<TPage>
    ) => TItem[] | undefined,
    ...paginationStrategies: PaginationStrategy[]
  ) {
    this.paginationStrategies = paginationStrategies;
  }

  public [Symbol.asyncIterator](): AsyncIterator<TItem> {
    return this.createAsyncIterator(this.getNextItem.bind(this));
  }

  public pages: AsyncIterable<TPagedResponse> = {
    [Symbol.asyncIterator]: () =>
      this.createAsyncIterator(this.getNextPage.bind(this)),
  };

  private createAsyncIterator<T>(
    getNext: (
      state: PagedDataState<TItem, TPage, TRequest>
    ) => Promise<IteratorResult<T>>
  ): AsyncIterator<T> {
    const state: PagedDataState<TItem, TPage, TRequest> = {
      requestManager: this.requestManager,
      request: this.requestManager.request,
      response: null,
      itemIndex: 0,
      items: [],
      strategySelector: new StrategySelector(this.paginationStrategies),
    };
    return { next: () => getNext(state) };
  }

  private async getNextItem(
    state: PagedDataState<TItem, TPage, TRequest>
  ): Promise<IteratorResult<TItem>> {
    if (
      state.itemIndex < state.items.length ||
      (await this.tryFetchingPage(state))
    ) {
      return { done: false, value: state.items[state.itemIndex++] };
    }

    return { done: true, value: undefined };
  }

  private async getNextPage(
    state: PagedDataState<TItem, TPage, TRequest>
  ): Promise<IteratorResult<TPagedResponse, any>> {
    if (await this.tryFetchingPage(state)) {
      return {
        done: false,
        value: this.pagedResponseCreator(state.response),
      };
    }

    return { done: true, value: undefined };
  }

  private async tryFetchingPage(
    state: PagedDataState<TItem, TPage, TRequest>
  ): Promise<boolean> {
    const strategy = state.strategySelector.select(state);
    if (strategy === null) {
      return false;
    }

    const response = await this.requestManager.executor(state.request);
    const items = this.itemsCreator(response);

    if (!items || items.length === 0) {
      return false;
    }

    state.itemIndex = 0;
    state.items = items;
    state.response = strategy.applyMetaData({
      ...response,
      items,
    });

    return true;
  }
}
