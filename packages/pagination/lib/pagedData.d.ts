import { ApiResponse, PagedAsyncIterable } from './coreInterfaces';
import { PaginationStrategy } from './paginationStrategy';
import { PagedResponse } from './pagedResponse';
export declare function createPagedData<TItem, TPage, TRequest, TPagedResponse>(executor: (request: TRequest) => Promise<ApiResponse<TPage>>, createPagedResponse: (response: PagedResponse<TItem, TPage> | null) => TPagedResponse, extractItems: (response: ApiResponse<TPage>) => TItem[] | undefined, ...paginationStrategies: PaginationStrategy[]): (request: TRequest, updater: (request: TRequest) => (pointer: string | null, setter: (value: any) => any) => TRequest) => PagedAsyncIterable<TItem, TPagedResponse>;
//# sourceMappingURL=pagedData.d.ts.map