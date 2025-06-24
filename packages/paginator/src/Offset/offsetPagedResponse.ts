import { PagedResponse } from '../pagedResponse';

export interface OffsetPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  offset: string;
}

export function createOffsetPagedResponse(
  response: PagedResponse<any, any>
): OffsetPagedResponse<any, any> | undefined {
  if (isOffsetPagedResponse(response)) {
    return response;
  }
  return undefined;
}

export function isOffsetPagedResponse(
  response: PagedResponse<any, any>
): response is OffsetPagedResponse<any, any> {
  return 'offset' in response;
}
