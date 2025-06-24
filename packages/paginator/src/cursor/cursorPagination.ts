import { PaginationStrategy } from '../paginationStrategy';
import { RequestBuilder } from '@apimatic/core/lib/http/requestBuilder';
import { PagedResponse } from '../pagedResponse';
import { CursorPagedResponse } from './cursorPagedResponse';
import { getValueByJsonPointer } from '../utilities';

export class CursorPagination implements PaginationStrategy {
  private readonly currentCursorPointer: string;
  private readonly nextCursorPointer: string;
  private nextCursorValue: string | null = null;

  constructor(currentCursorPointer: string, nextCursorPointer: string) {
    this.currentCursorPointer = currentCursorPointer;
    this.nextCursorPointer = nextCursorPointer;
  }

  public isApplicable(
    request: RequestBuilder<any, any>,
    response: PagedResponse<any, any> | null
  ): boolean {
    let isUpdated: boolean = false;
    request.updateParameterByJsonPointer(this.currentCursorPointer, (value) => {
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

  public withMetadata<TItem, TPage>(
    response: PagedResponse<TItem, TPage>
  ): CursorPagedResponse<TItem, TPage> {
    return {
      ...response,
      nextCursor: this.nextCursorValue,
    };
  }
}
