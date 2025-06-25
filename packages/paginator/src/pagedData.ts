import { ApiResponse, RequestBuilder } from './core';
import { PaginationStrategy } from './paginationStrategy';
import { PagedResponse } from './pagedResponse';

export interface PagedAsyncIterable<TItem, TPage> extends AsyncIterable<TItem> {
  pages(): AsyncIterable<TPage>;
}

interface PagedDataState<TItem, TPage> {
  request: RequestBuilder<any, any>;
  lastResponse: PagedResponse<TItem, TPage> | null;
  items: TItem[];
  itemIndex: number;
  strategy: PaginationStrategy | null;
}

export class PagedData<TItem, TPage, TPagedResponse>
  implements PagedAsyncIterable<TItem, TPagedResponse> {
  private readonly request: RequestBuilder<any, any>;
  private readonly executor: (
    req: RequestBuilder<any, any>
  ) => Promise<ApiResponse<TPage>>;
  private readonly pagedResponseCreator: (
    p: PagedResponse<TItem, TPage> | null
  ) => TPagedResponse;
  private readonly itemsCreator: (
    response: ApiResponse<TPage>
  ) => TItem[] | undefined;
  private readonly paginationStrategies: PaginationStrategy[];

  constructor(
    request: RequestBuilder<any, any>,
    executor: (req: RequestBuilder<any, any>) => Promise<ApiResponse<TPage>>,
    pagedResponseCreator: (
      p: PagedResponse<TItem, TPage> | null
    ) => TPagedResponse,
    itemsCreator: (response: ApiResponse<TPage>) => TItem[] | undefined,
    ...paginationStrategies: PaginationStrategy[]
  ) {
    this.request = request;
    this.executor = executor;
    this.pagedResponseCreator = pagedResponseCreator;
    this.itemsCreator = itemsCreator;
    this.paginationStrategies = paginationStrategies;
  }

  public [Symbol.asyncIterator](): AsyncIterator<TItem> {
    return this.createAsyncIterator(this.getNextItem.bind(this));
  }

  public pages(): AsyncIterable<TPagedResponse> {
    return {
      [Symbol.asyncIterator]: () =>
        this.createAsyncIterator(this.getNextPage.bind(this)),
    };
  }

  private createAsyncIterator<T>(
    getNext: (state: PagedDataState<TItem, TPage>) => Promise<IteratorResult<T>>
  ): AsyncIterator<T> {
    const state: PagedDataState<TItem, TPage> = {
      request: this.request.clone(),
      lastResponse: null,
      itemIndex: 0,
      items: [],
      strategy: null,
    };
    return { next: () => getNext(state) };
  }

  private async getNextItem(
    state: PagedDataState<TItem, TPage>
  ): Promise<IteratorResult<TItem>> {
    if (state.itemIndex < state.items.length) {
      return { done: false, value: state.items[state.itemIndex++] };
    }

    if (await this.tryFetchingPage(state)) {
      return this.getNextItem(state);
    }

    return { done: true, value: undefined };
  }

  private async getNextPage(
    state: PagedDataState<TItem, TPage>
  ): Promise<IteratorResult<TPagedResponse, any>> {
    if (await this.tryFetchingPage(state)) {
      return {
        done: false,
        value: this.pagedResponseCreator(state.lastResponse),
      };
    }

    return { done: true, value: undefined };
  }

  private async tryFetchingPage(
    state: PagedDataState<TItem, TPage>
  ): Promise<boolean> {
    const strategy = this.getApplicableStrategy(state);
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
    state.lastResponse = strategy.withMetadata({
      ...response,
      items,
    });

    return true;
  }

  private getApplicableStrategy(
    state: PagedDataState<TItem, TPage>
  ): PaginationStrategy | null {
    if (state.strategy === null) {
      return this.selectStrategy(state);
    }

    return state.strategy.isApplicable(state.request, state.lastResponse)
      ? state.strategy
      : null;
  }

  private selectStrategy(
    state: PagedDataState<TItem, TPage>
  ): PaginationStrategy | null {
    for (const strategy of this.paginationStrategies) {
      if (!strategy.isApplicable(state.request, state.lastResponse)) {
        continue;
      }
      if (state.lastResponse !== null) {
        // update the state only if not the first API call.
        state.strategy = strategy;
      }
      return strategy;
    }
    return null;
  }
}
