import { Pagination } from './pagination';
import { DefaultRequestBuilder } from '../http/requestBuilder';
import { NumberPagedResponse } from './numberPagedResponse';
import { PagedResponse } from './pagedResponse';

export class PagePagination<
  BaseUrlParamType,
  AuthParams,
  T,
  P
> extends Pagination<BaseUrlParamType, AuthParams, T, P> {
  private pagePointer: string;
  private pageNumber: string = '1';

  constructor(pagePointer: string) {
    super();
    this.pagePointer = pagePointer;
  }

  public isApplicable(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    currentData: PagedResponse<any, any> | null
  ): boolean {
    if (currentData === null) {
      return true;
    }

    let isUpdated: boolean = false;
    request.updateParameterByJsonPointer(this.pagePointer, (value) => {
      const numericValue = +(value ?? 0);
      const newPage = numericValue + 1;
      this.pageNumber = newPage.toString();
      isUpdated = true;
      return newPage;
    });
    return isUpdated;
  }

  public withMetadata(
    response: PagedResponse<T, P>
  ): NumberPagedResponse<T, P> {
    return {
      ...response,
      pageNumber: this.pageNumber,
    };
  }
}
