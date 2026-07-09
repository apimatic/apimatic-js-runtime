import { AbortController } from 'abort-controller';
import JSONBig from '@apimatic/json-bigint';
import { Schema, validateAndMap } from '@apimatic/schema';
import {
  ApiResponse,
  HttpContext,
  HttpInterceptorInterface,
  RequestOptions,
} from './coreInterfaces';
import { drainBodyToText, SseStream } from './sseStream';
import { RawSseEvent, SseDecodeResult, SseDecoder } from './sseTypes';

const SSE_CONTENT_TYPE = 'text/event-stream';

/**
 * Parses JSON with the same big-integer-safe reader the request builder's
 * `callAsJson` uses, so streamed frames decode identically to non-streaming
 * responses (integers beyond `Number.MAX_SAFE_INTEGER` keep their precision).
 */
const jsonBig = JSONBig();

/** Cap on how much of a non-2xx error body is buffered into text. */
const ERROR_BODY_MAX_BYTES = 64 * 1024;

/** The subset of the request builder the SSE machinery needs. */
export interface StreamCapableRequestBuilder {
  accept(acceptHeaderValue: string): void;
  intercept(
    interceptor: HttpInterceptorInterface<RequestOptions | undefined>
  ): void;
  callAsStream(
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<NodeJS.ReadableStream | Blob>>;
}

/**
 * A decoder that validates and maps each event's `data` payload against
 * `schema` (the same mechanism as the request builder's `callAsJson`), so a
 * single decoder works for every response type — `string()`, `number()`,
 * objects, arrays, etc. A frame that fails validation is surfaced as an
 * `SseDecodeError`.
 */
export function schemaSseDecoder<T>(schema: Schema<T>): SseDecoder<T> {
  return (raw: RawSseEvent): SseDecodeResult<T> => {
    const parsed = parseFrameData(raw.data);
    let mapped = validateAndMap(parsed, schema);
    if (mapped.errors && typeof parsed !== 'string') {
      // A plain-text frame can coincidentally be valid JSON (`123`, `true`,
      // `null`); when the schema rejects the parsed form, try the raw text
      // before failing so string schemas keep accepting such frames.
      const rawMapped = validateAndMap(raw.data, schema);
      if (!rawMapped.errors) {
        mapped = rawMapped;
      }
    }
    if (mapped.errors) {
      throw new Error(
        'SSE frame failed schema validation:\n' +
          mapped.errors.map((e) => e.message).join('\n')
      );
    }
    return { type: 'event', value: mapped.result };
  };
}

/**
 * Prepares a frame's `data` for schema validation. Structured payloads
 * (objects, arrays, numbers) arrive as JSON text and are parsed with the
 * big-integer-safe reader; a payload that isn't JSON — e.g. a plain-text
 * `string()` frame — is validated as the raw string as-is.
 */
function parseFrameData(data: string): unknown {
  try {
    return jsonBig.parse(data);
  } catch {
    return data;
  }
}

/**
 * Executes a request as a server-sent event stream. Core's
 * `callAsEventStream` hook delegates here.
 */
export async function createEventStream<T>(
  requestBuilder: StreamCapableRequestBuilder,
  requestOptions: RequestOptions | undefined,
  streamReadTimeout: number | undefined,
  decoder: SseDecoder<T>,
  terminator?: string
): Promise<ApiResponse<SseStream<T>>> {
  const controller = new AbortController();
  const userSignal = requestOptions?.abortSignal;
  if (userSignal !== undefined) {
    if (userSignal.aborted) {
      controller.abort();
    } else {
      const forwardAbort = () => controller.abort();
      userSignal.addEventListener('abort', forwardAbort);
      controller.signal.addEventListener('abort', () =>
        userSignal.removeEventListener('abort', forwardAbort)
      );
    }
  }
  const streamRequestOptions: RequestOptions = {
    ...requestOptions,
    abortSignal: controller.signal as unknown as RequestOptions['abortSignal'],
  };

  requestBuilder.accept(SSE_CONTENT_TYPE);
  requestBuilder.intercept(bufferErrorBodies);

  const wrappedDecoder = wrapDecoder(decoder, terminator);
  const response = await requestBuilder
    .callAsStream(streamRequestOptions)
    .catch((error) => {
      // Abort so the user-signal forwarding listener above is detached even
      // when the request itself fails (e.g. a non-2xx ApiError).
      controller.abort();
      throw error;
    });
  const stream = new SseStream<T>(response.result, {
    decoder: wrappedDecoder,
    controller,
    readTimeout: streamReadTimeout,
  });
  return { ...response, result: stream };
}

/** Drains a non-2xx stream body back into text before error handling. */
const bufferErrorBodies: HttpInterceptorInterface<
  RequestOptions | undefined
> = async (request, options, next) => {
  const context: HttpContext = await next(request, options);
  const { response } = context;
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return context;
  }
  const body = await drainBodyToText(response.body, ERROR_BODY_MAX_BYTES);
  return { ...context, response: { ...response, body } };
};

function wrapDecoder<T>(
  decoder: SseDecoder<T>,
  terminator: string | undefined
): SseDecoder<T> {
  if (terminator === undefined) {
    return decoder;
  }
  return (raw) => (raw.data === terminator ? { type: 'done' } : decoder(raw));
}
