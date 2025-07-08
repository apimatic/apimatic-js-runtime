import { PaginationStrategy } from '../paginationStrategy';
import { PagedResponse } from '../pagedResponse';
import { OffsetPagedResponse } from './offsetPagedResponse';
import { Request, updateRequestByJsonPointer } from '../request';

export class OffsetPagination implements PaginationStrategy {
  private readonly offsetPointer: string;
  private pageOffset: string = '0';

  constructor(offsetPointer: string) {
    this.offsetPointer = offsetPointer;
  }

  public tryPreparingRequest<TItem, TPage>(
    request: Request,
    response: PagedResponse<TItem, TPage> | null
  ): boolean {
    let isUpdated: boolean = false;

    updateRequestByJsonPointer(request, this.offsetPointer, (value) => {
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

  public applyMetaData<TItem, TPage>(
    response: PagedResponse<TItem, TPage>
  ): OffsetPagedResponse<TItem, TPage> {
    return {
      ...response,
      offset: this.pageOffset,
    };
  }
}
