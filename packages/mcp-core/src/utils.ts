import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Readable } from 'stream';

export function stringifyRawJson(object: unknown): string {
  return JSON.stringify(object, (_, value: unknown) => {
    // TODO: This is a bug. The bigint by its nature is such a large number
    // that it doesn't fit in the normal 'Number' type in JavaScript. That's
    // why they create another type for it. To parse or serialize JSON when
    // bigint is involved, you need to use a JSON parser that has built-in
    // support for it. You cannot hack bigint supported by using a "replacer"
    // method in an existing JSON parser/serializer. We use such a library
    // in our SDKs; however, we should only use that library when the SDK
    // is expecting bigint to be used.
    return typeof value === 'bigint' ? Number(value) : value;
  });
}

export async function createErrorMessage(
  error: unknown
): Promise<CallToolResult> {
  const err = error as {
    statusCode?: number;
    headers?: Record<string, string>;
    body?: string | Blob | NodeJS.ReadableStream;
    response?: {
      statusCode?: number;
      headers?: Record<string, string>;
      body?: string | Blob | NodeJS.ReadableStream;
    };
    message?: string;
  };

  const statusCode = err.statusCode ?? err.response?.statusCode ?? null;
  const headers = err.headers ?? err.response?.headers ?? {};
  let body = err.body ?? err.response?.body ?? err.message ?? null;

  if (statusCode !== null && body !== null && headers !== null) {
    if (body instanceof Blob) {
      body = await blobToBase64(body);
    }

    if (body instanceof Readable) {
      body = await streamToString(body as NodeJS.ReadableStream);
    }
    const errorObj: any = {
      statusCode,
      headers,
      body,
    };
    console.error('API Error:', errorObj);

    try {
      return wrapErrorMessage(stringifyRawJson(errorObj));
    } catch (stringifyError) {
      return wrapErrorMessage(
        `Tool Error: API error occurred, but details could not be serialized. Message: ${stringifyError}`
      );
    }
  } else if (error instanceof Error) {
    console.error('Unexpected Tool Error:', error.message);
    return wrapErrorMessage(`Tool Error: ${error.message}`);
  }

  console.error('Unexpected Tool Error:', stringifyRawJson(error));
  return wrapErrorMessage(`Tool Error: ${stringifyRawJson(error)}`);
}

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function wrapErrorMessage(message: string): CallToolResult {
  return {
    content: [{ type: 'text', text: message }],
    isError: true, // Indicate to the LLM that the tool failed
  };
}
