import { PagedResponse } from './pagedResponse';

export interface NumberPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  pageNumber: string;
}

export function createNumberPagedResponse(
  response: PagedResponse<any, any>
): NumberPagedResponse<any, any> | undefined {
  if (isNumberPagedResponse(response)) {
    return response;
  }
  return undefined;
}

function isNumberPagedResponse(
  response: PagedResponse<any, any>
): response is NumberPagedResponse<any, any> {
  return 'pageNumber' in response;
}
