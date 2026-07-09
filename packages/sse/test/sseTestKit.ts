import { SseEvent } from '../src/sseTypes';

/** Options for {@link mockSseBody}. */
export interface MockSseBodyOptions {
  /** Re-chunk the wire text into pieces of this many bytes before yielding. */
  chunkSize?: number;
  /** Milliseconds to wait between chunks. */
  delayMs?: number;
  /** Throw this error after all frames are sent. */
  failWith?: Error;
  /** Keep the connection open silently for this long after all frames. */
  stallMs?: number;
}

/** Builds an async-iterable byte stream from SSE wire-format frames. */
export function mockSseBody(
  frames: string[],
  options: MockSseBodyOptions = {}
): AsyncIterable<Uint8Array> {
  const { chunkSize, delayMs, failWith, stallMs } = options;
  return (async function* () {
    const encoder = new TextEncoder();
    const wire = encoder.encode(frames.join(''));
    const size =
      chunkSize !== undefined && chunkSize > 0 ? chunkSize : wire.length;
    for (let i = 0; i < wire.length; i += size) {
      if (delayMs !== undefined && delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      yield wire.slice(i, i + size);
    }
    if (stallMs !== undefined && stallMs > 0) {
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, stallMs);
        (timer as { unref?: () => void }).unref?.();
      });
    }
    if (failWith !== undefined) {
      throw failWith;
    }
  })();
}

/** Collects every value of an async iterable into an array. */
export async function collectStream<T>(stream: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of stream) {
    items.push(item);
  }
  return items;
}

/** Collects full events (with metadata) from a stream-like source. */
export async function collectEvents<T>(
  stream: AsyncIterable<SseEvent<T>>
): Promise<Array<SseEvent<T>>> {
  return collectStream(stream);
}
