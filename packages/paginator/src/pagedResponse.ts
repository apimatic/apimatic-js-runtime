import { ApiResponse } from '@apimatic/core-interfaces';

export interface PagedResponse<TItem, TPage> extends ApiResponse<TPage> {
  items: TItem[];
}
