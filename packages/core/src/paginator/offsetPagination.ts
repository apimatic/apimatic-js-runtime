import { Pagination } from './pagination';
import { DefaultRequestBuilder } from '../http/requestBuilder';
import { PagedResponse } from './pagedResponse';
import { OffsetPagedResponse } from './offsetPagedResponse';

export class OffsetPagination<
  BaseUrlParamType,
  AuthParams,
  T,
  P
> extends Pagination<BaseUrlParamType, AuthParams, T, P> {
  private offsetPointer: string;
  private pageOffset: string = '0';

  constructor(offsetPointer: string) {
    super();
    this.offsetPointer = offsetPointer; // '$request.query#/offset'
  }

  public isApplicable(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    currentData: PagedResponse<any, any> | null
  ): boolean {
    const dataLength = currentData?.items.length ?? 0;
    let isUpdated: boolean = false;

    request.updateParameterByJsonPointer(this.offsetPointer, (value) => {
      const numericValue = +(value ?? 0);
      const newOffset = numericValue + dataLength;
      this.pageOffset = String(newOffset);
      isUpdated = true;

      return newOffset;
    });

    return isUpdated;
  }

  public withMetadata(
    response: PagedResponse<T, P>
  ): OffsetPagedResponse<T, P> {
    return {
      ...response,
      offset: this.pageOffset,
    };
  }
}
