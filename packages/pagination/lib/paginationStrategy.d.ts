import { PagedResponse } from './pagedResponse';
import { PagedDataState } from './strategySelector';
export interface PaginationStrategy {
    /**
     * Check if this strategy can be applied on given request in state.
     * Updates the request if its applicable.
     *
     * @param state The state object containing the info about last API call.
     *              It will be updated if the strategy is applicable.
     * @returns True if this strategy is applicable on the given state of API.
     */
    tryPreparingRequest<TItem, TPage, TRequest>(state: PagedDataState<TItem, TPage, TRequest>): boolean;
    /**
     * Apply the metadata parameters to the response object.
     *
     * @param response The response of the current page to be modfied with
     *                 its metadata.
     */
    applyMetaData<TItem, TPage>(response: PagedResponse<TItem, TPage>): PagedResponse<TItem, TPage>;
}
//# sourceMappingURL=paginationStrategy.d.ts.map