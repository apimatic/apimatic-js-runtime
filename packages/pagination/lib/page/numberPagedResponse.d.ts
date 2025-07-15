import { PagedResponse } from '../pagedResponse';
export interface NumberPagedResponse<TItem, TPage> extends PagedResponse<TItem, TPage> {
    pageNumber: string;
}
export declare function createNumberPagedResponse(response: PagedResponse<any, any> | null): NumberPagedResponse<any, any>;
export declare function isNumberPagedResponse<TItem, TPage>(response: PagedResponse<TItem, TPage> | null): response is NumberPagedResponse<TItem, TPage>;
//# sourceMappingURL=numberPagedResponse.d.ts.map