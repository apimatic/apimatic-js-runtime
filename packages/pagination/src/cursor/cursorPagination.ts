import { PaginationStrategy } from '../paginationStrategy';
import { PagedResponse } from '../pagedResponse';
import { CursorPagedResponse } from './cursorPagedResponse';
import { getValueByJsonPointer } from '../utilities';
import { Request, updateRequestByJsonPointer } from '../request';

export class CursorPagination implements PaginationStrategy {
  private readonly currentCursorPointer: string;
  private readonly nextCursorPointer: string;
  private nextCursorValue: string | null = null;

  constructor(currentCursorPointer: string, nextCursorPointer: string) {
    this.currentCursorPointer = currentCursorPointer;
    this.nextCursorPointer = nextCursorPointer;
  }

  public tryPreparingRequest<TItem, TPage>(
    request: Request,
    response: PagedResponse<TItem, TPage> | null
  ): boolean {
    let isUpdated: boolean = false;
    updateRequestByJsonPointer(request, this.currentCursorPointer, (value) => {
      if (response === null) {
        isUpdated = true;
        if (value === undefined) {
          this.nextCursorValue = null;
          return value;
        }
        this.nextCursorValue = value;
        return value;
      }
      const nextCursor = getValueByJsonPointer(
        response,
        this.nextCursorPointer
      );
      if (nextCursor === null) {
        return value;
      }
      this.nextCursorValue = nextCursor;
      isUpdated = true;
      return nextCursor;
    });

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
