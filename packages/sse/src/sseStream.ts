import { AbortController } from 'abort-controller';
import { SseDecodeError } from './errors/sseDecodeError';
import { SseTimeoutError } from './errors/sseTimeoutError';
import { SseParser } from './sseParser';
import {
  RawSseEvent,
  SseAbortSignal,
  SseByteReader,
  SseDecoder,
  SseEvent,
} from './sseTypes';

/** Construction options for {@link SseStream}. */
export interface SseStreamOptions<T> {
  /** Decodes each raw event into a typed value. */
  decoder: SseDecoder<T>;
  /** Abort controller to adopt; a new one is created when omitted. */
  controller?: AbortController;
  /** Max ms to await the next frame before `SseTimeoutError`; 0 = no limit. */
  readTimeout?: number;
}

const ERROR_STASH = '__sseErrorStash__';

function armErrorStash(body: unknown): void {
  const emitter = body as {
    on?: (event: string, listener: (e: unknown) => void) => void;
    [ERROR_STASH]?: { error?: unknown };
  };
  if (
    emitter !== null &&
    typeof emitter === 'object' &&
    typeof emitter.on === 'function' &&
    emitter[ERROR_STASH] === undefined
  ) {
    const stash: { error?: unknown } = {};
    emitter[ERROR_STASH] = stash;
    emitter.on('error', (e: unknown) => {
      if (stash.error === undefined) {
        stash.error = e !== undefined ? e : new Error('SSE stream errored.');
      }
    });
  }
}

function stashedError(body: unknown): unknown {
  return (body as { [ERROR_STASH]?: { error?: unknown } })?.[ERROR_STASH]
    ?.error;
}

/**
 * A single-use, async-iterable stream of server-sent events. Iterate for
 * decoded values, or `withMetadata()` for full frames; breaking the loop (or
 * `close()`) aborts the request.
 */
export class SseStream<T> implements AsyncIterable<T> {
  /** Aborts the live request when triggered. */
  public readonly controller: AbortController;

  private readonly initialBody: unknown;
  private readonly decoder: SseDecoder<T>;
  private readonly readTimeout: number;
  private consumed = false;

  constructor(initialBody: unknown, options: SseStreamOptions<T>) {
    this.initialBody = initialBody;
    this.decoder = options.decoder;
    this.controller = options.controller ?? new AbortController();
    armErrorStash(initialBody);
    // 0 (or unset) means no idle timeout; the SDK configuration is where a
    // default stream read timeout is applied.
    this.readTimeout = options.readTimeout ?? 0;
    const asyncDispose: symbol | undefined = (Symbol as any).asyncDispose;
    if (asyncDispose !== undefined) {
      (this as any)[asyncDispose] = async () => this.close();
    }
  }

  /** Iterates decoded event values. */
  public [Symbol.asyncIterator](): AsyncIterator<T> {
    const events = this.withMetadata();
    return (async function* () {
      for await (const event of events) {
        yield event.data;
      }
    })();
  }

  /** Iterates full events, including `event`, `id` and `retry` metadata. */
  public withMetadata(): AsyncIterable<SseEvent<T>> {
    if (this.consumed) {
      throw new Error(
        'This SSE stream has already been consumed. ' +
          'Streams are single-use; make a new API call to re-read.'
      );
    }
    this.consumed = true;
    return this.run();
  }

  /** Aborts the connection and stops iteration. */
  public close(): void {
    this.controller.abort();
  }

  private async *run(): AsyncGenerator<SseEvent<T>, void, undefined> {
    const signal = this.controller.signal;
    const body = this.initialBody;
    const parser = new SseParser();

    try {
      for await (const raw of iterateBody(
        body,
        parser,
        signal,
        this.readTimeout
      )) {
        let decoded;
        try {
          decoded = this.decoder(raw);
        } catch (cause) {
          throw new SseDecodeError(raw.data, cause);
        }
        switch (decoded.type) {
          case 'done':
            return;
          case 'skip':
            continue;
          case 'event':
            yield {
              data: decoded.value,
              event: raw.event,
              id: raw.id,
              retry: raw.retry,
            };
        }
      }
    } catch (error) {
      // A user abort is a clean stop; anything else (a decode failure, an
      // idle SseTimeoutError, or a raw transport drop) surfaces to the caller.
      if (signal.aborted) {
        return;
      }
      throw error;
    } finally {
      this.controller.abort();
      destroyBody(body);
    }
  }
}

async function readWithTimeout<R>(
  read: Promise<R>,
  readTimeout: number,
  teardown: () => void
): Promise<R> {
  if (readTimeout <= 0) {
    return read;
  }
  read.catch(() => undefined);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      read,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          teardown();
          reject(new SseTimeoutError(readTimeout));
        }, readTimeout);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

async function* iterateBody(
  body: unknown,
  parser: SseParser,
  signal: SseAbortSignal,
  readTimeout: number
): AsyncGenerator<RawSseEvent, void, undefined> {
  if (typeof body === 'string') {
    yield* parser.feed(body);
    yield* parser.end();
    return;
  }

  if (isAsyncIterable(body)) {
    const preError = stashedError(body);
    if (preError !== undefined) {
      throw preError;
    }
    const abort = () => destroyBody(body);
    signal.addEventListener('abort', abort);
    const iterator = body[Symbol.asyncIterator]();
    try {
      for (;;) {
        const { done, value } = await readWithTimeout(
          iterator.next(),
          readTimeout,
          () => destroyBody(body)
        );
        if (done) {
          yield* parser.end();
          return;
        }
        throwIfAborted(signal);
        yield* parser.feed(coerceChunk(value));
      }
    } finally {
      signal.removeEventListener('abort', abort);
      if (typeof iterator.return === 'function') {
        Promise.resolve(iterator.return()).catch(() => undefined);
      }
    }
  }

  if (isWebReadableStream(body)) {
    const reader = body.getReader();
    const abort = () => {
      reader.cancel().catch(() => undefined);
    };
    signal.addEventListener('abort', abort);
    try {
      for (;;) {
        const { done, value } = await readWithTimeout(
          reader.read(),
          readTimeout,
          () => {
            reader.cancel().catch(() => undefined);
          }
        );
        if (done) {
          yield* parser.end();
          return;
        }
        throwIfAborted(signal);
        yield* parser.feed(coerceChunk(value));
      }
    } finally {
      signal.removeEventListener('abort', abort);
      reader.releaseLock();
    }
  }

  if (isBlobLike(body)) {
    const inner = typeof body.stream === 'function' ? body.stream() : undefined;
    if (
      inner !== undefined &&
      (isAsyncIterable(inner) || isWebReadableStream(inner))
    ) {
      yield* iterateBody(inner, parser, signal, readTimeout);
      return;
    }
    yield* parser.feed(await body.text());
    yield* parser.end();
    return;
  }

  throw new Error(
    'Unsupported SSE response body; expected a stream, Blob or string.'
  );
}

/** Reads a response body into text, up to `maxBytes`. */
export async function drainBodyToText(
  body: unknown,
  maxBytes: number
): Promise<string> {
  if (typeof body === 'string') {
    return body;
  }
  if (isBlobLike(body)) {
    const text = await body.text();
    return text.length > maxBytes ? text.slice(0, maxBytes) : text;
  }

  const decoder = new TextDecoder('utf-8');
  let out = '';
  let read = 0;
  const push = (chunk: unknown): boolean => {
    const piece =
      typeof chunk === 'string'
        ? chunk
        : decoder.decode(coerceChunk(chunk) as Uint8Array, { stream: true });
    out += piece;
    read += piece.length;
    return read < maxBytes;
  };

  if (isAsyncIterable(body)) {
    try {
      for await (const chunk of body) {
        if (!push(chunk)) {
          destroyBody(body);
          break;
        }
      }
    } catch {
      // return whatever was read before the body failed
    }
    return out + decoder.decode();
  }
  if (isWebReadableStream(body)) {
    const reader = body.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done || !push(value)) {
          break;
        }
      }
    } finally {
      reader.cancel().catch(() => undefined);
      reader.releaseLock();
    }
    return out + decoder.decode();
  }
  return String(body);
}

function coerceChunk(chunk: unknown): Uint8Array | string {
  if (typeof chunk === 'string' || chunk instanceof Uint8Array) {
    return chunk;
  }
  throw new Error('Unsupported chunk type in SSE response body.');
}

function throwIfAborted(signal: SseAbortSignal): void {
  if (signal.aborted) {
    const error = new Error('The SSE stream was aborted.');
    error.name = 'AbortError';
    throw error;
  }
}

function destroyBody(body: unknown): void {
  const destroy = (body as { destroy?: () => void })?.destroy;
  if (typeof destroy === 'function') {
    destroy.call(body);
  }
}

function isAsyncIterable(
  value: unknown
): value is AsyncIterable<Uint8Array | string> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as any)[Symbol.asyncIterator] === 'function'
  );
}

function isWebReadableStream(
  value: unknown
): value is { getReader(): SseByteReader } {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as any).getReader === 'function'
  );
}

function isBlobLike(
  value: unknown
): value is { stream?: () => unknown; text(): Promise<string> } {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as any).text === 'function'
  );
}
