import { PaginationStrategy } from './paginationStrategy';
import { PagedResponse } from './pagedResponse';

export interface PagedDataState<TItem, TPage, TRequest> {
  requestUpdater: (
    request: TRequest
  ) => (pointer: string | null, setter: (value: any) => any) => TRequest;
  request: TRequest;
  response: PagedResponse<TItem, TPage> | null;
  items: TItem[];
  itemIndex: number;
  strategySelector: StrategySelector<TItem, TPage>;
}

export class StrategySelector<TItem, TPage> {
  private selectedStrategy: PaginationStrategy | null = null;

  constructor(private readonly strategies: PaginationStrategy[]) {}

  public select<TRequest>(
    state: PagedDataState<TItem, TPage, TRequest>
  ): PaginationStrategy | null {
    if (this.selectedStrategy === null) {
      return this.selectStrategy(state);
    }

    return this.selectedStrategy.tryPreparingRequest(state)
      ? this.selectedStrategy
      : null;
  }

  private selectStrategy<TRequest>(
    state: PagedDataState<TItem, TPage, TRequest>
  ): PaginationStrategy | null {
    for (const strategy of this.strategies) {
      if (!strategy.tryPreparingRequest(state)) {
        continue;
      }
      if (state.response !== null) {
        // select strategy, if not the first API call i.e. response received.
        this.selectedStrategy = strategy;
      }
      return strategy;
    }
    return null;
  }
}
