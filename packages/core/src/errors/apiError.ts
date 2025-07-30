import JSONBig from '@apimatic/json-bigint';
import {
  ApiResponse,
  HttpContext,
  HttpRequest,
} from '@apimatic/core-interfaces';
import {
  convertFromStream,
  convertToStream,
} from '@apimatic/convert-to-stream';

/**
 * Thrown when the HTTP status code is not okay.
 *
 * The ApiError extends the ApiResponse interface, so all ApiResponse
 * properties are available.
 */
export class ApiError<T = {}>
  extends Error
  implements ApiResponse<T | undefined> {
  public request: HttpRequest;
  public statusCode: number;
  public headers: Record<string, string>;
  public result: T | undefined;
  public body: string | Blob | NodeJS.ReadableStream;

  constructor(context: HttpContext, message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    const { request, response } = context;
    this.request = request;
    this.statusCode = response.statusCode;
    this.headers = response.headers;
    this.body = response.body;
  }
}

export async function loadResult<T>(error: ApiError<T>): Promise<void> {
  const bodyString = await convertFromStream(error.body);
  error.result = parseBody(bodyString);
  error.body =
    typeof error.body === 'string' ? bodyString : convertToStream(bodyString);
}

function parseBody<T>(body: string): T | undefined {
  try {
    return JSONBig().parse(body);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' && console) {
      // tslint:disable-next-line:no-console
      console.warn(
        `Unexpected error: Could not parse HTTP response body. ${error.message}`
      );
    }
  }
  return undefined;
}
