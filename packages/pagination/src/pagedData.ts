import { ApiResponse, PagedAsyncIterable } from './coreInterfaces';
import { PaginationStrategy } from './paginationStrategy';
import { StrategySelector } from './strategySelector';
import { cloneRequest, Request } from './request';
import { PagedResponse } from './pagedResponse';

interface PagedDataState<TItem, TPage, TRequest extends Request> {
  request: TRequest;
  response: PagedResponse<TItem, TPage> | null;
  items: TItem[];
  itemIndex: number;
  strategySelector: StrategySelector<TItem, TPage>;
}

export class PagedData<TItem, TPage, TRequest extends Request, TPagedResponse>
  implements PagedAsyncIterable<TItem, TPagedResponse> {
  private readonly paginationStrategies: PaginationStrategy[];
  constructor(
    private readonly request: TRequest,
    private readonly executor: (req: TRequest) => Promise<ApiResponse<TPage>>,
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
      request: cloneRequest(this.request),
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
    const strategy = state.strategySelector.select(
      state.request,
      state.response
    );
    if (strategy === null) {
      return false;
    }

    const response = await this.executor(state.request);
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
