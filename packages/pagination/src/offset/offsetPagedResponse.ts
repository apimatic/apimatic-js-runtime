import { PagedResponse } from '../pagedResponse';

export interface OffsetPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  offset: string;
}

export function createOffsetPagedResponse<TItem, TPage>(
  response: PagedResponse<TItem, TPage> | null
): OffsetPagedResponse<TItem, TPage> {
  if (isOffsetPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of OffsetPagedResponse');
}

export function isOffsetPagedResponse<TItem, TPage>(
  response: PagedResponse<TItem, TPage> | null
): response is OffsetPagedResponse<TItem, TPage> {
  return response !== null && 'offset' in response;
}
