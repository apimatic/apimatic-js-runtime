/** A raw server-sent event as parsed off the wire. */
export interface RawSseEvent {
  /** The `data:` payload (multi-line data joined with `\n`). */
  data: string;
  /** The `event:` field value, if any. */
  event?: string;
  /** The `id:` field value in effect for this event, if any. */
  id?: string;
  /** The `retry:` reconnection delay, in milliseconds, if any. */
  retry?: number;
}

/** A typed server-sent event, produced by an {@link SseDecoder}. */
export interface SseEvent<T> {
  data: T;
  event?: string;
  id?: string;
  retry?: number;
}

/** The outcome of decoding one raw SSE frame. */
export type SseDecodeResult<T> =
  /** Surface this decoded value. */
  | { type: 'event'; value: T }
  /** Ignore this frame and keep streaming. */
  | { type: 'skip' }
  /** End the stream without surfacing anything. */
  | { type: 'done' };

/** Decodes a raw SSE event into a typed value. */
export type SseDecoder<T> = (raw: RawSseEvent) => SseDecodeResult<T>;

/** Response body shapes accepted by the SSE machinery. */
export type SseBody =
  | AsyncIterable<Uint8Array | string>
  | { getReader(): SseByteReader; cancel?(reason?: unknown): Promise<void> }
  | { stream(): unknown; text(): Promise<string> }
  | string;

/** Minimal structural type for a WHATWG ReadableStreamDefaultReader. */
export interface SseByteReader {
  read(): Promise<{ done: boolean; value?: Uint8Array | string }>;
  cancel(reason?: unknown): Promise<void>;
  releaseLock(): void;
}

/** Structural abort signal, satisfied by the DOM and polyfill signals. */
export interface SseAbortSignal {
  readonly aborted: boolean;
  addEventListener(type: 'abort', listener: () => void): void;
  removeEventListener(type: 'abort', listener: () => void): void;
}
