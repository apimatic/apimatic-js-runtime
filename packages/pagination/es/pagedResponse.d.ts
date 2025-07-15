import { ApiResponse } from './coreInterfaces';
/** An interface for the paged result of an API call. */
export interface PagedResponse<TItem, TPage> extends ApiResponse<TPage> {
    /** Items in this page. */
    items: TItem[];
}
//# sourceMappingURL=pagedResponse.d.ts.map