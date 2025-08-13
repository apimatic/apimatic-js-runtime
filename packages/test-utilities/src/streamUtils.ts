import { HttpClientInterface } from '@apimatic/core-interfaces';
import { convertFromStream } from '@apimatic/convert-to-stream';

/**
 * Get streaming data from a given URL.
 * @param client HttpClient instance to fetch data.
 * @param url URL from which to create the readable stream.
 * @returns Stream of data fetched from the URL.
 * @throws Error if unable to retrieve data from the URL.
 */
export async function getStreamData(
  client: HttpClientInterface,
  url: string
): Promise<NodeJS.ReadableStream | Blob> {
  const res = await client({ method: 'GET', url, responseType: 'stream' });
  if (res.statusCode !== 200 || typeof res.body === 'string') {
    throw new Error(`Unable to retrieve streaming data from ${url}`);
  }
  return res.body;
}

/**
 * Convert a NodeJS ReadableStream or Blob to a Buffer.
 * @param input NodeJS ReadableStream or Blob to convert.
 * @returns Promise resolving to a Buffer containing the input data.
 */
export async function toBuffer(
  input: NodeJS.ReadableStream | Blob | undefined
): Promise<Buffer> {
  if (input === undefined) {
    throw new Error(
      'Unsupported input type. Expected a Blob or ReadableStream.'
    );
  }
  const jsonString = await convertFromStream(input);
  return Buffer.from(jsonString);
}
