import { type HttpMethod } from './httpRequest';
export type CoreRequestBuilderFactory = (
  httpMethod: HttpMethod,
  path?: string
) => any;

export interface CoreClientInterface {
  getRequestBuilderFactory(): CoreSdkRequestBuilderFactory;
}

export type CoreSdkRequestBuilderFactory = CoreRequestBuilderFactory;
