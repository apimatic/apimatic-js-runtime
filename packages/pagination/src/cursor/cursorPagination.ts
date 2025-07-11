import { PaginationStrategy } from '../paginationStrategy';
import { PagedResponse } from '../pagedResponse';
import { CursorPagedResponse } from './cursorPagedResponse';
import { getValueByJsonPointer } from '../utilities';
import { PagedDataState } from '../strategySelector';

export class CursorPagination implements PaginationStrategy {
  private readonly currentCursorPointer: string;
  private readonly nextCursorPointer: string;
  private nextCursorValue: string | null = null;

  constructor(currentCursorPointer: string, nextCursorPointer: string) {
    this.currentCursorPointer = currentCursorPointer;
    this.nextCursorPointer = nextCursorPointer;
  }

  public tryPreparingRequest<TItem, TPage, TRequest>(
    state: PagedDataState<TItem, TPage, TRequest>
  ): boolean {
    let isUpdated: boolean = false;
    state.request = state.requestManager.updater(state.request)(
      this.currentCursorPointer,
      (value) => {
        if (state.response === null) {
          isUpdated = true;
          if (value === undefined) {
            this.nextCursorValue = null;
            return value;
          }
          this.nextCursorValue = value;
          return value;
        }
        const nextCursor = getValueByJsonPointer(
          state.response,
          this.nextCursorPointer
        );
        if (nextCursor === null) {
          return value;
        }
        this.nextCursorValue = nextCursor;
        isUpdated = true;
        return nextCursor;
      }
    );

    return isUpdated;
  }

  public applyMetaData<TItem, TPage>(
    response: PagedResponse<TItem, TPage>
  ): CursorPagedResponse<TItem, TPage> {
    return {
      ...response,
      nextCursor: this.nextCursorValue,
    };
  }
}
