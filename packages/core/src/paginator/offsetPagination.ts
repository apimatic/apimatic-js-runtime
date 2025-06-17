import { Pagination } from './pagination';
import { DefaultRequestBuilder } from '../http/requestBuilder';
import { PagedResponse } from './pagedResponse';
import { OffsetPagedResponse } from './offsetPagedResponse';

export class OffsetPagination<
  BaseUrlParamType,
  AuthParams,
  I,
  P
> extends Pagination<BaseUrlParamType, AuthParams, I, P> {
  private readonly offsetPointer: string;
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
    response: PagedResponse<I, P>
  ): OffsetPagedResponse<I, P> {
    return {
      ...response,
      offset: this.pageOffset,
    };
  }
}
