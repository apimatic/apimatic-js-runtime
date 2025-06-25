import { PagedResponse } from '../pagedResponse';

export interface OffsetPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  offset: string;
}

export function createOffsetPagedResponse(
  response: PagedResponse<any, any> | null
): OffsetPagedResponse<any, any> {
  if (isOffsetPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of OffsetPagedResponse');
}

export function isOffsetPagedResponse(
  response: PagedResponse<any, any> | null
): response is OffsetPagedResponse<any, any> {
  return response !== null && 'offset' in response;
}
