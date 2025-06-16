import { Pagination } from './pagination';
import { DefaultRequestBuilder } from '../http/requestBuilder';
import { PagedResponse } from './pagedResponse';
import { CursorPagedResponse } from './cursorPagedResponse';
import { getValueByJsonPointer } from '../apiHelper';

export class CursorPagination<
  BaseUrlParamType,
  AuthParams,
  T,
  P
> extends Pagination<BaseUrlParamType, AuthParams, T, P> {
  private currentCursorPointer: string;
  private nextCursorPointer: string;
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
    if (currentData === null) {
      this.nextCursorValue = null;
      return true;
    }
    const nextCursor = getValueByJsonPointer(
      currentData,
      this.nextCursorPointer
    );
    this.nextCursorValue = nextCursor;
    let isUpdated: boolean = false;
    request.updateParameterByJsonPointer(this.currentCursorPointer, () => {
      isUpdated = true;
      return nextCursor;
    });

    return isUpdated;
  }

  public withMetadata(
    response: PagedResponse<T, P>
  ): CursorPagedResponse<T, P> {
    return {
      ...response,
      nextCursor: this.nextCursorValue,
    };
  }
}
