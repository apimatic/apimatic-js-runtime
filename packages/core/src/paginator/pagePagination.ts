import { Pagination } from './pagination';
import { DefaultRequestBuilder } from '../http/requestBuilder';
import { NumberPagedResponse } from './numberPagedResponse';
import { PagedResponse } from './pagedResponse';

export class PagePagination<
  BaseUrlParamType,
  AuthParams,
  I,
  P
> extends Pagination<BaseUrlParamType, AuthParams, I, P> {
  private readonly pagePointer: string;
  private pageNumber: string = '1';

  constructor(pagePointer: string) {
    super();
    this.pagePointer = pagePointer;
  }

  public isApplicable(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    currentData: PagedResponse<any, any> | null
  ): boolean {
    let isUpdated: boolean = false;
    request.updateParameterByJsonPointer(this.pagePointer, (value) => {
      if (currentData === null) {
        isUpdated = true;
        if (value === undefined || value === null) {
          this.pageNumber = '1';
          return 1;
        }
        this.pageNumber = value;
        return value;
      }
      const numericValue = +(value ?? 0);
      const newPage = numericValue + 1;
      this.pageNumber = newPage.toString();
      isUpdated = true;
      return newPage;
    });
    return isUpdated;
  }

  public withMetadata(
    response: PagedResponse<I, P>
  ): NumberPagedResponse<I, P> {
    return {
      ...response,
      pageNumber: this.pageNumber,
    };
  }
}
