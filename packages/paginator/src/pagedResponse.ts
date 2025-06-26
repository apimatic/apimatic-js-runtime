import { ApiResponse } from './coreInterfaces';

export interface PagedResponse<TItem, TPage> extends ApiResponse<TPage> {
  items: TItem[];
}
