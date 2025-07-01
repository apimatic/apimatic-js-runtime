import { PagedResponse } from '../pagedResponse';

export interface LinkPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  nextLink: string | null;
}

export function createLinkPagedResponse<TItem, TPage>(
  response: PagedResponse<TItem, TPage> | null
): LinkPagedResponse<TItem, TPage> {
  if (isLinkPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of LinkPagedResponse');
}

export function isLinkPagedResponse<TItem, TPage>(
  response: PagedResponse<TItem, TPage> | null
): response is LinkPagedResponse<TItem, TPage> {
  return response !== null && 'nextLink' in response;
}
