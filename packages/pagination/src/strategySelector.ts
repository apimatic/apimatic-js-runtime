import { PaginationStrategy } from './paginationStrategy';
import { PagedResponse } from './pagedResponse';
import { RequestBuilder } from './pagedData';

export class StrategySelector<
  TItem,
  TPage,
  TRequest extends RequestBuilder<TRequest>
> {
  private selectedStrategy: PaginationStrategy | null = null;

  constructor(private readonly strategies: PaginationStrategy[]) {}

  public reset(): void {
    this.selectedStrategy = null;
  }

  public getApplicableStrategy(
    request: TRequest,
    lastResponse: PagedResponse<TItem, TPage> | null
  ): PaginationStrategy | null {
    if (this.selectedStrategy === null) {
      return this.selectStrategy(request, lastResponse);
    }

    return this.selectedStrategy.tryPreparingRequest(request, lastResponse)
      ? this.selectedStrategy
      : null;
  }

  private selectStrategy(
    request: TRequest,
    lastResponse: PagedResponse<TItem, TPage> | null
  ): PaginationStrategy | null {
    for (const strategy of this.strategies) {
      if (!strategy.tryPreparingRequest(request, lastResponse)) {
        continue;
      }
      if (lastResponse !== null) {
        // update the state only if not the first API call.
        this.selectedStrategy = strategy;
      }
      return strategy;
    }
    return null;
  }
}
