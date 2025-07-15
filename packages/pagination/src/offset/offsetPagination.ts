import { PaginationStrategy } from '../paginationStrategy';
import { PagedResponse } from '../pagedResponse';
import { OffsetPagedResponse } from './offsetPagedResponse';
import { PagedDataState } from '../strategySelector';

export class OffsetPagination implements PaginationStrategy {
  private readonly offsetPointer: string;
  private pageOffset: string = '0';

  constructor(offsetPointer: string) {
    this.offsetPointer = offsetPointer;
  }

  public tryPreparingRequest<TItem, TPage, TRequest>(
    state: PagedDataState<TItem, TPage, TRequest>
  ): boolean {
    let isUpdated: boolean = false;

    state.request = state.requestUpdater(state.request)(
      this.offsetPointer,
      (value) => {
        if (state.response === null) {
          isUpdated = true;
          if (value === undefined || value === null) {
            this.pageOffset = '0';
            return value;
          }
          this.pageOffset = String(value);
          return value;
        }
        const dataLength = state.response?.items.length ?? 0;
        const numericValue = +(value ?? 0);
        const newOffset = numericValue + dataLength;
        this.pageOffset = String(newOffset);
        isUpdated = true;
        return newOffset;
      }
    );

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
