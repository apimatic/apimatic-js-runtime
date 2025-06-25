import { PagedResponse } from '../pagedResponse';

export interface CursorPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  nextCursor: string | null;
}

export function createCursorPagedResponse(
  response: PagedResponse<any, any> | null
): CursorPagedResponse<any, any> {
  if (isCursorPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of CursorPagedResponse');
}

export function isCursorPagedResponse(
  response: PagedResponse<any, any> | null
): response is CursorPagedResponse<any, any> {
  return response !== null && 'nextCursor' in response;
}
