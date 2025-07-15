/// <reference types="node" />
import { HttpClientInterface } from '@apimatic/core-interfaces';
/**
 * Get streaming data from a given URL.
 * @param client Instance of HttpClient to be used.
 * @param url URL from which to create the readable stream.
 * @returns Stream of data fetched from the URL.
 * @throws Error if unable to retrieve data from the URL.
 */
export declare function getStreamData(client: HttpClientInterface, url: string): Promise<NodeJS.ReadableStream | Blob>;
/**
 * Convert a NodeJS ReadableStream or Blob to a Buffer.
 * @param input NodeJS ReadableStream or Blob to convert.
 * @returns Promise resolving to a Buffer containing the input data.
 */
export declare function toBuffer(input: NodeJS.ReadableStream | Blob | undefined): Promise<Buffer>;
//# sourceMappingURL=streamUtils.d.ts.map