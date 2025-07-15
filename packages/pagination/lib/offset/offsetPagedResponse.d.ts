import { PagedResponse } from '../pagedResponse';
export interface OffsetPagedResponse<TItem, TPage> extends PagedResponse<TItem, TPage> {
    offset: string;
}
export declare function createOffsetPagedResponse<TItem, TPage>(response: PagedResponse<TItem, TPage> | null): OffsetPagedResponse<TItem, TPage>;
export declare function isOffsetPagedResponse<TItem, TPage>(response: PagedResponse<TItem, TPage> | null): response is OffsetPagedResponse<TItem, TPage>;
//# sourceMappingURL=offsetPagedResponse.d.ts.map