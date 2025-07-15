import { PagedResponse } from '../pagedResponse';
export interface LinkPagedResponse<TItem, TPage> extends PagedResponse<TItem, TPage> {
    nextLink: string | null;
}
export declare function createLinkPagedResponse<TItem, TPage>(response: PagedResponse<TItem, TPage> | null): LinkPagedResponse<TItem, TPage>;
export declare function isLinkPagedResponse<TItem, TPage>(response: PagedResponse<TItem, TPage> | null): response is LinkPagedResponse<TItem, TPage>;
//# sourceMappingURL=linkPagedResponse.d.ts.map