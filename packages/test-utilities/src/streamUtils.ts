import { HttpClientInterface } from '@apimatic/core-interfaces';
import { Readable } from 'stream';

/**
 * Get streaming data from a given URL.
 * @param client Instance of HttpClient to be used.
 * @param url URL from which to create the readable stream.
 * @returns Stream of data fetched from the URL.
 * @throws Error if unable to retrieve data from the URL.
 */
export async function getStreamData(client: HttpClientInterface, url: string) {
  const res = await client({
    method: 'GET',
    url,
    responseType: 'stream',
  });
  if (res.statusCode !== 200 || typeof res.body === 'string') {
    throw new Error(`Unable to retrieve streaming data from ${url}`);
  }
  return res.body as any;
}

/**
 * Check if input matches the contents of a file by comparing stream data or Blob data.
 * @param expected Expected data (NodeJS ReadableStream or Blob).
 * @param actual Input data to compare against file contents (NodeJS ReadableStream or Blob).
 * @returns Promise resolving to true if input matches file contents, otherwise false.
 */
export async function areStreamsMatching(
  expected: NodeJS.ReadableStream | Blob,
  actual: NodeJS.ReadableStream | Blob | undefined
): Promise<boolean> {
  if (typeof actual === 'undefined') {
    return false;
  }
  try {
    const expectedBuffer =
      expected instanceof Readable
        ? await streamToBuffer(expected)
        : await blobToBuffer(expected as Blob);

    const actualBuffer =
      actual instanceof Readable
        ? await streamToBuffer(actual)
        : await blobToBuffer(actual as Blob);

    return Buffer.compare(actualBuffer, expectedBuffer) === 0;
  } catch (error) {
    return false;
  }
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
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read Blob as ArrayBuffer.'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
  return Buffer.from(await arrayBuffer);
}
