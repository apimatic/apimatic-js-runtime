import { PaginationStrategy } from './paginationStrategy';
import { PagedResponse } from './pagedResponse';
export interface PagedDataState<TItem, TPage, TRequest> {
    requestUpdater: (request: TRequest) => (pointer: string | null, setter: (value: any) => any) => TRequest;
    request: TRequest;
    response: PagedResponse<TItem, TPage> | null;
    items: TItem[];
    itemIndex: number;
    strategySelector: StrategySelector<TItem, TPage>;
}
export declare class StrategySelector<TItem, TPage> {
    private readonly strategies;
    private selectedStrategy;
    constructor(strategies: PaginationStrategy[]);
    select<TRequest>(state: PagedDataState<TItem, TPage, TRequest>): PaginationStrategy | null;
    private selectStrategy;
}
//# sourceMappingURL=strategySelector.d.ts.map