import { PaginationStrategy } from '../paginationStrategy';
import { PagedResponse } from '../pagedResponse';
import { LinkPagedResponse } from './linkPagedResponse';
import { PagedDataState } from '../strategySelector';
export declare class LinkPagination implements PaginationStrategy {
    private readonly nextLinkPointer;
    private nextLinkValue;
    constructor(nextLinkPointer: string);
    tryPreparingRequest<TItem, TPage, TRequest>(state: PagedDataState<TItem, TPage, TRequest>): boolean;
    applyMetaData<TItem, TPage>(response: PagedResponse<TItem, TPage>): LinkPagedResponse<TItem, TPage>;
}
//# sourceMappingURL=linkPagination.d.ts.map