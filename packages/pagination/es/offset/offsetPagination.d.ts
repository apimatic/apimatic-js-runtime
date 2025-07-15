import { PaginationStrategy } from '../paginationStrategy';
import { PagedResponse } from '../pagedResponse';
import { OffsetPagedResponse } from './offsetPagedResponse';
import { PagedDataState } from '../strategySelector';
export declare class OffsetPagination implements PaginationStrategy {
    private readonly offsetPointer;
    private pageOffset;
    constructor(offsetPointer: string);
    tryPreparingRequest<TItem, TPage, TRequest>(state: PagedDataState<TItem, TPage, TRequest>): boolean;
    applyMetaData<TItem, TPage>(response: PagedResponse<TItem, TPage>): OffsetPagedResponse<TItem, TPage>;
}
//# sourceMappingURL=offsetPagination.d.ts.map