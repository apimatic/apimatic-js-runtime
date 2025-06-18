import { PagedResponse } from './pagedResponse';

export interface LinkPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  nextLink: string | null;
}

export function createLinkPagedResponse(
  response: PagedResponse<any, any>
): LinkPagedResponse<any, any> | undefined {
  if (isLinkPagedResponse(response)) {
    return response;
  }
  return undefined;
}

export function isLinkPagedResponse(
  response: PagedResponse<any, any>
): response is LinkPagedResponse<any, any> {
  return 'nextLink' in response;
}
