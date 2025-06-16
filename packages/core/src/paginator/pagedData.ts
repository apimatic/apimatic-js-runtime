import { DefaultRequestBuilder } from '../http/requestBuilder';
import { Schema } from '../schema';
import { ApiResponse, RequestOptions } from '@apimatic/core-interfaces';
import { Pagination } from './pagination';
import { PagedResponse } from './pagedResponse';

export interface PagedAsyncIterable<TItem, TPage> extends AsyncIterable<TItem> {
  pages(): AsyncIterable<TPage>;
}

export class PagedData<T, P, PageWrapper, BaseUrlParamType, AuthParams>
  implements PagedAsyncIterable<T, PageWrapper> {
  private request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>;
  private schema: Schema<P>;
  private requestOptions?: RequestOptions;
  private pageResponseCreator: (
    p: PagedResponse<T, P>
  ) => PageWrapper | undefined;
  private getData: (response: ApiResponse<P>) => T[] | undefined;
  private paginationStrategies: Array<
    Pagination<BaseUrlParamType, AuthParams, T, P>
  >;
  private selectedPaginationStrategy: Pagination<
    BaseUrlParamType,
    AuthParams,
    T,
    P
  > | null;

  constructor(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    schema: Schema<P>,
    requestOptions: RequestOptions | undefined,
    pageResponseCreator: (p: PagedResponse<T, P>) => PageWrapper | undefined,
    getData: (response: ApiResponse<P>) => T[] | undefined,
    ...paginationStrategies: Array<
      Pagination<BaseUrlParamType, AuthParams, T, P>
    >
  ) {
    this.request = request;
    this.schema = schema;
    this.pageResponseCreator = pageResponseCreator;
    this.getData = getData;
    this.requestOptions = requestOptions;
    this.paginationStrategies = paginationStrategies;
    this.selectedPaginationStrategy = null;
  }

  public [Symbol.asyncIterator](): AsyncIterator<T> {
    const request = this.request.clone();
    let currentPage: PagedResponse<T, P> | null = null;
    let currentItems: T[] = [];
    let currentIndex = 0;

    return {
      next: async (): Promise<IteratorResult<T>> => {
        if (currentIndex < currentItems.length) {
          return { done: false, value: currentItems[currentIndex++] };
        }

        currentPage = await this.fetchPage(request, currentPage);

        if (currentPage === null) {
          return { done: true, value: undefined };
        }

        currentItems = currentPage.items || [];
        currentIndex = 0;

        return currentItems.length > 0
          ? { done: false, value: currentItems[currentIndex++] }
          : { done: true, value: undefined };
      },
    };
  }

  public pages(): AsyncIterable<PageWrapper> {
    const request = this.request.clone();

    return {
      [Symbol.asyncIterator]: () => {
        let currentPage: PagedResponse<T, P> | null = null;

        return {
          next: async (): Promise<IteratorResult<PageWrapper>> => {
            currentPage = await this.fetchPage(request, currentPage);

            if (currentPage === null) {
              return { done: true, value: undefined };
            }

            const wrappedPage = this.pageResponseCreator(currentPage);

            return wrappedPage
              ? { done: false, value: wrappedPage }
              : { done: true, value: undefined };
          },
        };
      },
    };
  }

  private async fetchPage(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    currentPage: PagedResponse<T, P> | null
  ): Promise<PagedResponse<T, P> | null> {
    let pagedResponse: PagedResponse<T, P>;
    let isApplicable: boolean;

    // First call
    if (this.selectedPaginationStrategy === null) {
      for (const pagination of this.paginationStrategies) {
        isApplicable = pagination.isApplicable(request, currentPage);
        if (isApplicable) {
          if (!currentPage) {
            this.selectedPaginationStrategy = pagination;
          }
          const callResponse = await request.callAsJson(
            this.schema,
            this.requestOptions
          );
          const callData = this.getData(callResponse);
          if (!callData || callData.length === 0) {
            return null;
          }
          pagedResponse = {
            ...callResponse,
            items: callData,
          };
          return pagination.withMetadata(pagedResponse);
        }
      }
      if (this.selectedPaginationStrategy === null) {
        return null;
      }
    }

    // Subsequent calls
    isApplicable = this.selectedPaginationStrategy.isApplicable(
      request,
      currentPage
    );
    if (!isApplicable) {
      return null;
    }
    const subsequentCallResponse = await request.callAsJson(
      this.schema,
      this.requestOptions
    );
    const subsequentCallData = this.getData(subsequentCallResponse);
    if (!subsequentCallData || subsequentCallData.length === 0) {
      return null;
    }
    pagedResponse = {
      ...subsequentCallResponse,
      items: subsequentCallData,
    };
    return this.selectedPaginationStrategy.withMetadata(pagedResponse);
  }
}
