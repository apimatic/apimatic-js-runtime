import { PagedResponse } from '../pagedResponse';
export interface CursorPagedResponse<TItem, TPage> extends PagedResponse<TItem, TPage> {
    nextCursor: string | null;
}
export declare function createCursorPagedResponse<TItem, TPage>(response: PagedResponse<TItem, TPage> | null): CursorPagedResponse<TItem, TPage>;
export declare function isCursorPagedResponse<TItem, TPage>(response: PagedResponse<TItem, TPage> | null): response is CursorPagedResponse<TItem, TPage>;
//# sourceMappingURL=cursorPagedResponse.d.ts.map