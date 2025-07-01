import { PagedResponse } from '../pagedResponse';

export interface CursorPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  nextCursor: string | null;
}

export function createCursorPagedResponse<TItem, TPage>(
  response: PagedResponse<TItem, TPage> | null
): CursorPagedResponse<TItem, TPage> {
  if (isCursorPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of CursorPagedResponse');
}

export function isCursorPagedResponse<TItem, TPage>(
  response: PagedResponse<TItem, TPage> | null
): response is CursorPagedResponse<TItem, TPage> {
  return response !== null && 'nextCursor' in response;
}
