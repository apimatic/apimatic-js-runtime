import { PassThrough } from 'stream';
import { SseDecodeError, SseTimeoutError } from '../src';
import { drainBodyToText, SseStream } from '../src/sseStream';
import { SseDecoder } from '../src/sseTypes';
import { collectStream, mockSseBody } from './sseTestKit';

const passthrough: SseDecoder<string> = (raw) => ({
  type: 'event',
  value: raw.data,
});

function makeStream(
  body: unknown,
  decoder: SseDecoder<string>,
  readTimeout?: number
): SseStream<string> {
  return new SseStream<string>(body, { decoder, readTimeout });
}

describe('SseStream', () => {
  it('yields decoded values via for-await', async () => {
    const stream = makeStream(
      mockSseBody(['data: one\n\n', 'data: two\n\n', ': ping\n\n']),
      passthrough
    );
    expect(await collectStream(stream)).toEqual(['one', 'two']);
  });

  it('yields metadata via withMetadata()', async () => {
    const stream = makeStream(
      mockSseBody(['event: line\nid: 1\ndata: hello\n\n']),
      passthrough
    );
    const events = await collectStream(stream.withMetadata());
    expect(events).toEqual([
      { data: 'hello', event: 'line', id: '1', retry: undefined },
    ]);
  });

  it('parses across pathological chunk boundaries', async () => {
    const stream = makeStream(
      mockSseBody(['data: café ☕\n\n', 'data: done\n\n'], { chunkSize: 1 }),
      passthrough
    );
    expect(await collectStream(stream)).toEqual(['café ☕', 'done']);
  });

  it('ends without surfacing the event when the decoder reports done', async () => {
    const decoder: SseDecoder<string> = (raw) =>
      raw.data === '[DONE]'
        ? { type: 'done' }
        : { type: 'event', value: raw.data };
    const stream = makeStream(
      mockSseBody(['data: a\n\n', 'data: [DONE]\n\n', 'data: never\n\n']),
      decoder
    );
    expect(await collectStream(stream)).toEqual(['a']);
  });

  it('skips a frame without ending the stream when the decoder reports skip', async () => {
    const decoder: SseDecoder<string> = (raw) =>
      raw.data === 'ignore'
        ? { type: 'skip' }
        : { type: 'event', value: raw.data };
    const stream = makeStream(
      mockSseBody(['data: a\n\n', 'data: ignore\n\n', 'data: b\n\n']),
      decoder
    );
    expect(await collectStream(stream)).toEqual(['a', 'b']);
  });

  it('is single-use', async () => {
    const stream = makeStream(mockSseBody(['data: a\n\n']), passthrough);
    await collectStream(stream);
    expect(() => stream.withMetadata()).toThrow(/already been consumed/);
  });

  it('stops quietly when aborted mid-stream', async () => {
    const stream = makeStream(
      mockSseBody(['data: 1\n\n', 'data: 2\n\n', 'data: 3\n\n'], {
        chunkSize: 8,
        delayMs: 5,
      }),
      passthrough
    );
    const received: string[] = [];
    for await (const item of stream) {
      received.push(item);
      stream.controller.abort();
    }
    expect(received).toEqual(['1']);
  });

  it('does not crash when the body errors before consumption begins', async () => {
    const body = new PassThrough();
    const stream = makeStream(body, passthrough);
    // The connection resets BEFORE the consumer starts iterating. Without
    // an armed error listener this is an unhandled 'error' → process crash.
    body.destroy(new Error('reset before consumption'));
    await new Promise((resolve) => setImmediate(resolve));
    await expect(collectStream(stream)).rejects.toThrow(
      'reset before consumption'
    );
  });

  it('surfaces a mid-stream transport drop to the consumer', async () => {
    const stream = makeStream(
      mockSseBody(['data: a\n\n'], { failWith: new Error('boom') }),
      passthrough
    );
    await expect(collectStream(stream)).rejects.toThrow('boom');
  });

  describe('read timeout (streaming options)', () => {
    it('throws SseTimeoutError when the server stalls between frames', async () => {
      const stream = makeStream(
        mockSseBody(['data: a\n\n'], { stallMs: 5000 }),
        passthrough,
        50 // readTimeout
      );
      expect.assertions(2);
      try {
        await collectStream(stream);
      } catch (error) {
        expect(error).toBeInstanceOf(SseTimeoutError);
        expect((error as SseTimeoutError).idleTimeoutMs).toBe(50);
      }
    });

    it('a steadily-sending server never times out', async () => {
      const stream = makeStream(
        mockSseBody(['data: a\n\n', ': ping\n\n', 'data: b\n\n'], {
          chunkSize: 4,
          delayMs: 20,
        }),
        passthrough,
        100 // readTimeout far above the 20ms inter-chunk gap
      );
      expect(await collectStream(stream)).toEqual(['a', 'b']);
    });
  });

  describe('decode errors', () => {
    it('wraps decoder failures in SseDecodeError with the raw frame', async () => {
      const stream = makeStream(mockSseBody(['data: not json\n\n']), (raw) => ({
        type: 'event',
        value: JSON.parse(raw.data),
      }));
      expect.assertions(3);
      try {
        await collectStream(stream);
      } catch (error) {
        expect(error).toBeInstanceOf(SseDecodeError);
        expect((error as SseDecodeError).rawFrame).toBe('not json');
        expect((error as SseDecodeError).cause).toBeInstanceOf(SyntaxError);
      }
    });

    it('a JSON decoder parses frames into typed values', async () => {
      const jsonDecoder: SseDecoder<{ n: number }> = (raw) => ({
        type: 'event',
        value: JSON.parse(raw.data),
      });
      const stream = new SseStream<{ n: number }>(
        mockSseBody(['data: {"n":1}\n\n', 'data: {"n":2}\n\n']),
        { decoder: jsonDecoder }
      );
      expect(await collectStream(stream)).toEqual([{ n: 1 }, { n: 2 }]);
    });
  });

  describe('body sources', () => {
    it('reads a plain string body', async () => {
      const stream = makeStream('data: hi\n\ndata: bye\n\n', passthrough);
      expect(await collectStream(stream)).toEqual(['hi', 'bye']);
    });

    it('reads a web ReadableStream (getReader) body', async () => {
      const stream = makeStream(
        webReadableStreamOf(['data: a\n\n', 'data: b\n\n']),
        passthrough
      );
      expect(await collectStream(stream)).toEqual(['a', 'b']);
    });

    it('reads a Blob-like body via text()', async () => {
      const stream = makeStream(blobOf('data: x\n\ndata: y\n\n'), passthrough);
      expect(await collectStream(stream)).toEqual(['x', 'y']);
    });

    it('throws on an unsupported chunk type', async () => {
      async function* numbers() {
        yield 123 as unknown as Uint8Array;
      }
      const stream = makeStream(numbers(), passthrough);
      await expect(collectStream(stream)).rejects.toThrow(
        'Unsupported chunk type'
      );
    });

    it('throws on an unsupported body type', async () => {
      const stream = makeStream(42, passthrough);
      await expect(collectStream(stream)).rejects.toThrow(
        /Unsupported SSE response body/
      );
    });
  });

  describe('close()', () => {
    it('aborts the underlying controller', () => {
      const stream = makeStream(mockSseBody(['data: a\n\n']), passthrough);
      expect(stream.controller.signal.aborted).toBe(false);
      stream.close();
      expect(stream.controller.signal.aborted).toBe(true);
    });
  });
});

describe('drainBodyToText', () => {
  it('returns a string body unchanged', async () => {
    expect(await drainBodyToText('hello', 1000)).toBe('hello');
  });

  it('reads a Blob-like body and truncates to maxBytes', async () => {
    expect(await drainBodyToText(blobOf('abcdef'), 1000)).toBe('abcdef');
    expect(await drainBodyToText(blobOf('abcdef'), 3)).toBe('abc');
  });

  it('drains an async-iterable body of mixed chunk types', async () => {
    async function* body() {
      yield new TextEncoder().encode('hello ');
      yield 'world';
    }
    expect(await drainBodyToText(body(), 1000)).toBe('hello world');
  });

  it('stops draining an async-iterable body once maxBytes is reached', async () => {
    async function* body() {
      yield 'aaaa';
      yield 'bbbb';
      yield 'cccc';
    }
    const out = await drainBodyToText(body(), 5);
    expect(out.startsWith('aaaa')).toBe(true);
    expect(out.length).toBeLessThan('aaaabbbbcccc'.length);
  });

  it('returns whatever was read before an async-iterable body errors', async () => {
    async function* body() {
      yield 'partial';
      throw new Error('mid-stream failure');
    }
    expect(await drainBodyToText(body(), 1000)).toBe('partial');
  });

  it('drains a web ReadableStream body', async () => {
    const body = webReadableStreamOf(['chunk1 ', 'chunk2']);
    expect(await drainBodyToText(body, 1000)).toBe('chunk1 chunk2');
  });

  it('falls back to String() for an unknown body', async () => {
    expect(await drainBodyToText(42, 1000)).toBe('42');
  });
});

/** A minimal WHATWG-style readable stream exposing only `getReader()`. */
function webReadableStreamOf(frames: string[]) {
  const chunks = frames.map((f) => new TextEncoder().encode(f));
  let i = 0;
  return {
    getReader() {
      return {
        read: async () =>
          i < chunks.length
            ? { done: false, value: chunks[i++] }
            : { done: true, value: undefined },
        cancel: async () => undefined,
        releaseLock: () => undefined,
      };
    },
  };
}

/** A minimal Blob-like body exposing only `text()`. */
function blobOf(text: string) {
  return { text: async () => text };
}
