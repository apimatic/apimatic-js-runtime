# @apimatic/sse

Server-Sent Events (SSE) utilities for APIMatic-generated TypeScript SDKs:

- **Spec-compliant incremental parser** (`SseParser`) — chunk-boundary
  buffering (including split multi-byte UTF-8 and split CRLF), multi-line
  `data:` folding, comment/heartbeat skipping, BOM handling, and the
  WHATWG `id:`/`retry:` field rules.
- **`SseStream<T>`** — a single-use async-iterable stream with
  `withMetadata()`, abort-on-break cancellation, and single-use enforcement.
- **Read timeout** — bounds the wait for the server between frames (never
  consumer processing time); a stall surfaces as a typed `SseTimeoutError`.
- **Typed errors** — `SseError` base, `SseTimeoutError` (idle stall),
  `SseDecodeError` (a frame that couldn't be decoded). A mid-stream transport
  drop surfaces the raw underlying error to the consumer.
- **`createEventStream`** — the factory that core's
  `RequestBuilder.callAsEventStream(...)` hook delegates to (mirroring how
  `paginate()` delegates to `@apimatic/pagination`'s `createPagedData`):
  executes the request as an SSE stream and buffers non-2xx error bodies back
  to text.

## Usage

Generated SDK code (via `@apimatic/core`'s request builder):

```ts
import { createEventStream } from '@apimatic/sse';

const req = this.createRequest('GET', '/paragraphs');
// core's callAsEventStream hands the factory the request builder plus the
// client-wide stream read timeout (ms).
const { result: stream } = await req.callAsEventStream((req, streamReadTimeout) =>
  createEventStream(
    req,
    requestOptions,
    streamReadTimeout,
    (raw) => ({ done: false, value: raw.data }) // a decoder, e.g. schemaSseDecoder(schema)
  )
);

for await (const event of stream) {
  console.log(event);
}
```

The client-wide stream read timeout is a plain `number` (milliseconds),
configured on the SDK like `timeout` — a `0` or unset value means no idle
timeout.
