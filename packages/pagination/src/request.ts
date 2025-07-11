import { ApiResponse } from '@apimatic/core-interfaces';

export interface RequestManager<TRequest, TResult> {
  request: TRequest;
  executor(req: TRequest): Promise<ApiResponse<TResult>>;
  updater(
    req: TRequest
  ): (pointer: string | null, setter: (value: any) => any) => TRequest;
}
