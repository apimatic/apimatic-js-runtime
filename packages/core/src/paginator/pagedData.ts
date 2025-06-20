import { DefaultRequestBuilder } from '../http/requestBuilder';
import { Schema } from '../schema';
import { ApiResponse, RequestOptions } from '@apimatic/core-interfaces';
import { PaginationStrategy } from './paginationStrategy';
import { PagedResponse } from './pagedResponse';

export interface PagedAsyncIterable<I, P> extends AsyncIterable<I> {
  pages(): AsyncIterable<P>;
}

export class PagedData<I, P, PageWrapper, BaseUrlParamType, AuthParams>
  implements PagedAsyncIterable<I, PageWrapper> {
  private readonly schema: Schema<P>;
  private readonly requestOptions?: RequestOptions;
  private readonly pageResponseCreator: (
    p: PagedResponse<I, P>
  ) => PageWrapper | undefined;
  private readonly getData: (response: ApiResponse<P>) => I[] | undefined;
  private readonly paginationStrategies: PaginationStrategy[];
  private request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>;
  private selectedPaginationStrategy: PaginationStrategy | null;

  constructor(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    schema: Schema<P>,
    requestOptions: RequestOptions | undefined,
    pageResponseCreator: (p: PagedResponse<I, P>) => PageWrapper | undefined,
    getData: (response: ApiResponse<P>) => I[] | undefined,
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

  public [Symbol.asyncIterator](): AsyncIterator<I> {
    const request = this.request.clone();
    this.resetPaginationStrategy();
    const state = {
      currentPage: null as PagedResponse<I, P> | null,
      currentItems: [] as I[],
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
      currentPage: null as PagedResponse<I, P> | null,
    };

    return {
      [Symbol.asyncIterator]: () => ({
        next: () => this.getNextPage(request, state),
      }),
    };
  }

  private async getNextItem(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    state: {
      currentPage: PagedResponse<I, P> | null;
      currentItems: I[];
      currentIndex: number;
    }
  ): Promise<IteratorResult<I>> {
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
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    state: { currentPage: PagedResponse<I, P> | null }
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
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    currentPage: PagedResponse<I, P> | null
  ): Promise<PagedResponse<I, P> | null> {
    const strategy = this.getApplicableStrategy(request, currentPage);
    if (!strategy) {
      return null;
    }

    return this.executeRequest(request, strategy);
  }

  private getApplicableStrategy(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    currentPage: PagedResponse<I, P> | null
  ): PaginationStrategy | null {
    if (this.selectedPaginationStrategy) {
      return this.selectedPaginationStrategy.isApplicable(request, currentPage)
        ? this.selectedPaginationStrategy
        : null;
    }

    return this.selectStrategy(request, currentPage);
  }

  private selectStrategy(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    currentPage: PagedResponse<I, P> | null
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
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    strategy: PaginationStrategy
  ): Promise<PagedResponse<I, P> | null> {
    const response = await request.callAsJson(this.schema, this.requestOptions);
    const data = this.getData(response);

    if (!data || data.length === 0) {
      return null;
    }

    const pagedResponse: PagedResponse<I, P> = {
      ...response,
      items: data,
    };

    return strategy.withMetadata(pagedResponse);
  }

  private resetPaginationStrategy(): void {
    this.selectedPaginationStrategy = null;
  }
}
