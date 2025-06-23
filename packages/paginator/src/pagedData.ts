import { RequestBuilder } from '@apimatic/core/lib/http/requestBuilder';
import { Schema } from '@apimatic/core/lib/schema';
import { ApiResponse, RequestOptions } from '@apimatic/core-interfaces';
import { PaginationStrategy } from './paginationStrategy';
import { PagedResponse } from './pagedResponse';

export interface PagedAsyncIterable<TItem, TPage> extends AsyncIterable<TItem> {
  pages(): AsyncIterable<TPage>;
}

export class PagedData<TItem, TPage, PageWrapper, BaseUrlParamType, AuthParams>
  implements PagedAsyncIterable<TItem, PageWrapper> {
  private readonly schema: Schema<TPage>;
  private readonly requestOptions?: RequestOptions;
  private readonly pageResponseCreator: (
    p: PagedResponse<TItem, TPage>
  ) => PageWrapper | undefined;
  private readonly getData: (
    response: ApiResponse<TPage>
  ) => TItem[] | undefined;
  private readonly paginationStrategies: PaginationStrategy[];
  private readonly request: RequestBuilder<BaseUrlParamType, AuthParams>;
  private selectedPaginationStrategy: PaginationStrategy | null;

  constructor(
    request: RequestBuilder<BaseUrlParamType, AuthParams>,
    schema: Schema<TPage>,
    requestOptions: RequestOptions | undefined,
    pageResponseCreator: (
      p: PagedResponse<TItem, TPage>
    ) => PageWrapper | undefined,
    getData: (response: ApiResponse<TPage>) => TItem[] | undefined,
    ...paginationStrategies: PaginationStrategy[]
  ) {
    this.request = request;
    this.schema = schema;
    this.pageResponseCreator = pageResponseCreator;
    this.getData = getData;
    this.requestOptions = requestOptions;
    this.paginationStrategies = paginationStrategies;
    this.selectedPaginationStrategy = null;
  }

  public [Symbol.asyncIterator](): AsyncIterator<TItem> {
    const request = this.request.clone();
    this.resetPaginationStrategy();
    const state = {
      currentPage: null as PagedResponse<TItem, TPage> | null,
      currentItems: [] as TItem[],
      currentIndex: 0,
    };

    return {
      next: () => this.getNextItem(request, state),
    };
  }

  public pages(): AsyncIterable<PageWrapper> {
    const request = this.request.clone();
    this.resetPaginationStrategy();
    const state = {
      currentPage: null as PagedResponse<TItem, TPage> | null,
    };

    return {
      [Symbol.asyncIterator]: () => ({
        next: () => this.getNextPage(request, state),
      }),
    };
  }

  private async getNextItem(
    request: RequestBuilder<BaseUrlParamType, AuthParams>,
    state: {
      currentPage: PagedResponse<TItem, TPage> | null;
      currentItems: TItem[];
      currentIndex: number;
    }
  ): Promise<IteratorResult<TItem>> {
    if (state.currentIndex < state.currentItems.length) {
      return { done: false, value: state.currentItems[state.currentIndex++] };
    }

    state.currentPage = await this.fetchPage(request, state.currentPage);

    if (state.currentPage === null) {
      return { done: true, value: undefined };
    }

    state.currentItems = state.currentPage.items || [];
    state.currentIndex = 0;

    return state.currentItems.length > 0
      ? { done: false, value: state.currentItems[state.currentIndex++] }
      : { done: true, value: undefined };
  }

  private async getNextPage(
    request: RequestBuilder<BaseUrlParamType, AuthParams>,
    state: { currentPage: PagedResponse<TItem, TPage> | null }
  ): Promise<IteratorResult<PageWrapper>> {
    state.currentPage = await this.fetchPage(request, state.currentPage);

    if (state.currentPage === null) {
      return { done: true, value: undefined };
    }

    const wrappedPage = this.pageResponseCreator(state.currentPage);

    return wrappedPage
      ? { done: false, value: wrappedPage }
      : { done: true, value: undefined };
  }

  private async fetchPage(
    request: RequestBuilder<BaseUrlParamType, AuthParams>,
    currentPage: PagedResponse<TItem, TPage> | null
  ): Promise<PagedResponse<TItem, TPage> | null> {
    const strategy = this.getApplicableStrategy(request, currentPage);
    if (!strategy) {
      return null;
    }

    return this.executeRequest(request, strategy);
  }

  private getApplicableStrategy(
    request: RequestBuilder<BaseUrlParamType, AuthParams>,
    currentPage: PagedResponse<TItem, TPage> | null
  ): PaginationStrategy | null {
    if (this.selectedPaginationStrategy) {
      return this.selectedPaginationStrategy.isApplicable(request, currentPage)
        ? this.selectedPaginationStrategy
        : null;
    }

    return this.selectStrategy(request, currentPage);
  }

  private selectStrategy(
    request: RequestBuilder<BaseUrlParamType, AuthParams>,
    currentPage: PagedResponse<TItem, TPage> | null
  ): PaginationStrategy | null {
    for (const strategy of this.paginationStrategies) {
      if (!strategy.isApplicable(request, currentPage)) {
        continue;
      }
      if (currentPage) {
        this.selectedPaginationStrategy = strategy;
      }
      return strategy;
    }
    return null;
  }

  private async executeRequest(
    request: RequestBuilder<BaseUrlParamType, AuthParams>,
    strategy: PaginationStrategy
  ): Promise<PagedResponse<TItem, TPage> | null> {
    const response = await request.callAsJson(this.schema, this.requestOptions);
    const data = this.getData(response);

    if (!data || data.length === 0) {
      return null;
    }

    const pagedResponse: PagedResponse<TItem, TPage> = {
      ...response,
      items: data,
    };

    return strategy.withMetadata(pagedResponse);
  }

  private resetPaginationStrategy(): void {
    this.selectedPaginationStrategy = null;
  }
}
