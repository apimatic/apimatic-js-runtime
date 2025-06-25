import { ApiResponse } from './core';

export interface PagedResponse<TItem, TPage> extends ApiResponse<TPage> {
  items: TItem[];
}
