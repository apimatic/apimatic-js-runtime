import { PaginationStrategy } from '../paginationStrategy';
import { NumberPagedResponse } from './numberPagedResponse';
import { PagedResponse } from '../pagedResponse';
import { PagedDataState } from '../strategySelector';
export declare class PagePagination implements PaginationStrategy {
    private readonly pagePointer;
    private pageNumber;
    constructor(pagePointer: string);
    tryPreparingRequest<TItem, TPage, TRequest>(state: PagedDataState<TItem, TPage, TRequest>): boolean;
    applyMetaData<TItem, TPage>(response: PagedResponse<TItem, TPage>): NumberPagedResponse<TItem, TPage>;
}
//# sourceMappingURL=pagePagination.d.ts.map