import { PaginationStrategy } from '../paginationStrategy';
import { PagedResponse } from '../pagedResponse';
import { CursorPagedResponse } from './cursorPagedResponse';
import { PagedDataState } from '../strategySelector';
export declare class CursorPagination implements PaginationStrategy {
    private readonly currentCursorPointer;
    private readonly nextCursorPointer;
    private nextCursorValue;
    constructor(currentCursorPointer: string, nextCursorPointer: string);
    tryPreparingRequest<TItem, TPage, TRequest>(state: PagedDataState<TItem, TPage, TRequest>): boolean;
    applyMetaData<TItem, TPage>(response: PagedResponse<TItem, TPage>): CursorPagedResponse<TItem, TPage>;
}
//# sourceMappingURL=cursorPagination.d.ts.map