import { AbortController } from 'abort-controller';
import { number, object, string } from '@apimatic/schema';
import {
  createEventStream,
  schemaSseDecoder,
  StreamCapableRequestBuilder,
} from '../src/createEventStream';
import {
  HttpInterceptorInterface,
  RequestOptions,
} from '../src/coreInterfaces';
import { SseDecodeError } from '../src/errors/sseDecodeError';
import { SseDecoder } from '../src/sseTypes';
import { collectStream, mockSseBody } from './sseTestKit';

interface Point {
  index: number;
  text: string;
}

const pointSchema = object({
  index: ['index', number()],
  text: ['text', string()],
});

/** A decoder that yields each frame's `data` payload as-is. */
const passthrough: SseDecoder<string> = (raw) => ({
  type: 'event',
  value: raw.data,
});

/**
 * A fake request builder. A single mutable header bag is snapshotted on the
 * `callAsStream` call, so `connection` records the headers the request was
 * made with (e.g. the SSE accept header).
 */
function fakeRequest(makeBody: () => unknown) {
  const headers: Record<string, unknown> = {};
  let connection: Record<string, unknown> = {};
  const req: StreamCapableRequestBuilder = {
    accept: (value: string) => {
      headers.accept = value;
    },
    intercept: () => undefined,
    callAsStream: async () => {
      connection = { ...headers };
      return {
        request: {},
        statusCode: 200,
        headers: { 'content-type': 'text/event-stream' },
        body: '',
        result: makeBody(),
      } as any;
    },
  };
  return { req, connection: () => connection };
}

describe('createEventStream', () => {
  it('yields decoded data and returns response metadata', async () => {
    const { req, connection } = fakeRequest(() =>
      mockSseBody(['data: a\n\n', 'data: b\n\n'])
    );
    const response = await createEventStream(req, {}, undefined, passthrough);
    expect(response.statusCode).toBe(200);
    expect(connection().accept).toBe('text/event-stream');
    expect(await collectStream(response.result)).toEqual(['a', 'b']);
  });

  it('stops at an exact string terminator without surfacing it', async () => {
    const { req } = fakeRequest(() =>
      mockSseBody(['data: a\n\n', 'data: [DONE]\n\n', 'data: never\n\n'])
    );
    const { result } = await createEventStream(
      req,
      {},
      undefined,
      passthrough,
      '[DONE]'
    );
    expect(await collectStream(result)).toEqual(['a']);
  });

  it('surfaces a mid-stream drop as an error (no reconnection)', async () => {
    const { req } = fakeRequest(() =>
      mockSseBody(['data: a\n\n'], { failWith: new Error('drop') })
    );
    const { result } = await createEventStream(req, {}, undefined, passthrough);
    await expect(collectStream(result)).rejects.toThrow('drop');
  });

  it('schemaSseDecoder validates and maps each frame against a schema', async () => {
    const { req } = fakeRequest(() =>
      mockSseBody([
        'data: {"index":1,"text":"a"}\n\n',
        'data: {"index":2,"text":"b"}\n\n',
      ])
    );
    const { result } = await createEventStream<Point>(
      req,
      {},
      undefined,
      schemaSseDecoder(pointSchema)
    );
    expect(await collectStream(result)).toEqual([
      { index: 1, text: 'a' },
      { index: 2, text: 'b' },
    ]);
  });

  it('schemaSseDecoder(string()) validates plain-text frames without JSON parsing', async () => {
    const { req } = fakeRequest(() =>
      mockSseBody(['data: the quick brown fox\n\n', 'data: lazy dog\n\n'])
    );
    const { result } = await createEventStream<string>(
      req,
      {},
      undefined,
      schemaSseDecoder(string())
    );
    expect(await collectStream(result)).toEqual([
      'the quick brown fox',
      'lazy dog',
    ]);
  });

  it('schemaSseDecoder surfaces a schema mismatch as SseDecodeError', async () => {
    const { req } = fakeRequest(() =>
      mockSseBody(['data: {"index":"not-a-number","text":"a"}\n\n'])
    );
    const { result } = await createEventStream<Point>(
      req,
      {},
      undefined,
      schemaSseDecoder(pointSchema)
    );
    await expect(collectStream(result)).rejects.toThrow(SseDecodeError);
  });

  it('propagates request options (abort signal) to the stream controller', async () => {
    const aborted = new AbortController();
    aborted.abort();
    const { req } = fakeRequest(() => mockSseBody(['data: a\n\n']));
    const { result } = await createEventStream(
      req,
      {
        // polyfill signal: structurally fine, lacks newer DOM-only sugar
        abortSignal: aborted.signal as unknown as AbortSignal,
      },
      undefined,
      passthrough
    );
    expect(result.controller.signal.aborted).toBe(true);
  });

  it('forwards a later user abort to the stream controller', async () => {
    const userController = new AbortController();
    const { req } = fakeRequest(() => mockSseBody(['data: a\n\n']));
    const { result } = await createEventStream(
      req,
      { abortSignal: userController.signal as unknown as AbortSignal },
      undefined,
      passthrough
    );
    expect(result.controller.signal.aborted).toBe(false);
    userController.abort();
    expect(result.controller.signal.aborted).toBe(true);
  });

  it('buffers only non-2xx error bodies via the interceptor', async () => {
    let interceptor:
      | HttpInterceptorInterface<RequestOptions | undefined>
      | undefined;
    const req: StreamCapableRequestBuilder = {
      accept: () => undefined,
      intercept: (i) => {
        interceptor = i;
      },
      callAsStream: async () =>
        ({ statusCode: 200, headers: {}, result: mockSseBody([]) } as any),
    };
    await createEventStream(req, {}, undefined, passthrough);
    expect(interceptor).toBeDefined();

    // A 2xx response body is passed through untouched.
    const okBody = mockSseBody(['data: ok\n\n']);
    const okContext = await interceptor!(
      {} as unknown as any,
      undefined,
      (async () => ({
        request: {},
        response: { statusCode: 200, headers: {}, body: okBody },
      })) as unknown as any
    );
    expect((okContext as any).response.body).toBe(okBody);

    // A non-2xx response body is drained into text.
    const errContext = await interceptor!(
      {} as unknown as any,
      undefined,
      (async () => ({
        request: {},
        response: {
          statusCode: 500,
          headers: {},
          body: mockSseBody(['{"error":', '"boom"}']),
        },
      })) as unknown as any
    );
    expect((errContext as any).response.body).toBe('{"error":"boom"}');
  });
});
