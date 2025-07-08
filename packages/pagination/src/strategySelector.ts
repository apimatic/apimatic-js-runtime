import { PaginationStrategy } from './paginationStrategy';
import { PagedResponse } from './pagedResponse';
import { Request } from './request';

export class StrategySelector<TItem, TPage> {
  private selectedStrategy: PaginationStrategy | null = null;

  constructor(private readonly strategies: PaginationStrategy[]) {}

  public select(
    request: Request,
    response: PagedResponse<TItem, TPage> | null
  ): PaginationStrategy | null {
    if (this.selectedStrategy === null) {
      return this.selectStrategy(request, response);
    }

    return this.selectedStrategy.tryPreparingRequest(request, response)
      ? this.selectedStrategy
      : null;
  }

  private selectStrategy(
    request: Request,
    response: PagedResponse<TItem, TPage> | null
  ): PaginationStrategy | null {
    for (const strategy of this.strategies) {
      if (!strategy.tryPreparingRequest(request, response)) {
        continue;
      }
      if (response !== null) {
        // select strategy, if not the first API call i.e. response received.
        this.selectedStrategy = strategy;
      }
      return strategy;
    }
    return null;
  }
}
