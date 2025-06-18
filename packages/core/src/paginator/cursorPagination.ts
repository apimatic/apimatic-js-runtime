import { Pagination } from './pagination';
import { DefaultRequestBuilder } from '../http/requestBuilder';
import { PagedResponse } from './pagedResponse';
import { CursorPagedResponse } from './cursorPagedResponse';
import { getValueByJsonPointer } from '../apiHelper';

export class CursorPagination<
  BaseUrlParamType,
  AuthParams,
  I,
  P
> extends Pagination<BaseUrlParamType, AuthParams, I, P> {
  private readonly currentCursorPointer: string;
  private readonly nextCursorPointer: string;
  private nextCursorValue: string | null = null;

  constructor(currentCursorPointer: string, nextCursorPointer: string) {
    super();
    this.currentCursorPointer = currentCursorPointer;
    this.nextCursorPointer = nextCursorPointer;
  }

  public isApplicable(
    request: DefaultRequestBuilder<BaseUrlParamType, AuthParams>,
    currentData: PagedResponse<any, any> | null
  ): boolean {
    let isUpdated: boolean = false;
    request.updateParameterByJsonPointer(this.currentCursorPointer, (value) => {
      if (currentData === null) {
        isUpdated = true;
        if (value === undefined) {
          this.nextCursorValue = null;
          return null;
        }
        this.nextCursorValue = value;
        return value;
      }
      const nextCursor = getValueByJsonPointer(
        currentData,
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

  public withMetadata(
    response: PagedResponse<I, P>
  ): CursorPagedResponse<I, P> {
    return {
      ...response,
      nextCursor: this.nextCursorValue,
    };
  }
}
