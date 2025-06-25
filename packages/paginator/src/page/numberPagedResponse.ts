import { PagedResponse } from '../pagedResponse';

export interface NumberPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  pageNumber: string;
}

export function createNumberPagedResponse(
  response: PagedResponse<any, any> | null
): NumberPagedResponse<any, any> {
  if (isNumberPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of NumberPagedResponse');
}

export function isNumberPagedResponse(
  response: PagedResponse<any, any> | null
): response is NumberPagedResponse<any, any> {
  return response !== null && 'pageNumber' in response;
}
