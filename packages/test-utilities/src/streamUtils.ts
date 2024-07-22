import { HttpClientInterface } from '@apimatic/core-interfaces';
import { Readable } from 'stream';

/**
 * Get streaming data from a given URL.
 * @param client Instance of HttpClient to be used.
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
  if (typeof Blob !== 'undefined' && input instanceof Blob) {
    return blobToBuffer(input);
  }
  if (typeof Readable !== 'undefined' && input instanceof Readable) {
    return streamToBuffer(input);
  }
  throw new Error('Unsupported input type. Expected a Blob or ReadableStream.');
}

/**
 * Convert a NodeJS ReadableStream to a Buffer.
 * @param stream Readable stream to convert.
 * @returns Promise resolving to a Buffer containing stream data.
 */
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Convert a Blob to a Buffer.
 * @param blob Blob to convert.
 * @returns Promise resolving to an Buffer containing blob data.
 */
async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
  return Buffer.from(await arrayBuffer);
}
