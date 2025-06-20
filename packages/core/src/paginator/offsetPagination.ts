import { PaginationStrategy } from './paginationStrategy';
import { RequestBuilder } from '../http/requestBuilder';
import { PagedResponse } from './pagedResponse';
import { OffsetPagedResponse } from './offsetPagedResponse';

export class OffsetPagination implements PaginationStrategy {
  private readonly offsetPointer: string;
  private pageOffset: string = '0';

  constructor(offsetPointer: string) {
    this.offsetPointer = offsetPointer;
  }

  public isApplicable(
    request: RequestBuilder<any, any>,
    response: PagedResponse<any, any> | null
  ): boolean {
    let isUpdated: boolean = false;

    request.updateParameterByJsonPointer(this.offsetPointer, (value) => {
      if (response === null) {
        isUpdated = true;
        if (value === undefined || value === null) {
          this.pageOffset = '0';
          return value;
        }
        this.pageOffset = String(value);
        return value;
      }
      const dataLength = response?.items.length ?? 0;
      const numericValue = +(value ?? 0);
      const newOffset = numericValue + dataLength;
      this.pageOffset = String(newOffset);
      isUpdated = true;
      return newOffset;
    });

    return isUpdated;
  }

  public withMetadata<I, P>(
    response: PagedResponse<I, P>
  ): OffsetPagedResponse<I, P> {
    return {
      ...response,
      offset: this.pageOffset,
    };
  }
}
