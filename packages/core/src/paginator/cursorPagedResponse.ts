import { PagedResponse } from './pagedResponse';

export interface CursorPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  nextCursor: string | null;
}

export function createCursorPagedResponse(
  response: PagedResponse<any, any>
): CursorPagedResponse<any, any> | undefined {
  if (isCursorPagedResponse(response)) {
    return response;
  }
  return undefined;
}

function isCursorPagedResponse(
  response: PagedResponse<any, any>
): response is CursorPagedResponse<any, any> {
  return 'nextCursor' in response;
}
