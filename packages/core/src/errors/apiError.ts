import JSONBig from '@apimatic/json-bigint';
import {
  ApiResponse,
  HttpContext,
  HttpRequest,
} from '@apimatic/core-interfaces';
import { Readable } from 'stream';

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

  public async setResult(): Promise<void> {
    try {
      if (typeof this.body === 'string' && this.body !== '') {
        this.result = this.parseStringBody(this.body);
      }
      if (typeof Readable !== 'undefined' && this.body instanceof Readable) {
        this.result = await this.parseStreamBody(this.body);
      }
      if (typeof Blob !== 'undefined' && this.body instanceof Blob) {
        this.result = await this.parseBlobBody(this.body);
      }
    } catch (error) {
      this.logParseWarning(error);
    }
  }

  private parseStringBody(body: string): T | undefined {
    const jsonBig = JSONBig();
    return jsonBig.parse(body);
  }

  private async parseStreamBody(body: Readable): Promise<T | undefined> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const jsonString = Buffer.concat(chunks).toString();
    return JSON.parse(jsonString);
  }

  private async parseBlobBody(body: Blob): Promise<T | undefined> {
    const arrayBuffer = await this.blobToArrayBuffer(body);
    const buffer = Buffer.from(arrayBuffer);
    const jsonString = buffer.toString();
    return JSON.parse(jsonString);
  }

  private blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  private logParseWarning(error: any): void {
    if (process.env.NODE_ENV !== 'production' && console) {
      // tslint:disable-next-line:no-console
      console.warn(
        `Unexpected error: Could not parse HTTP response body. ${error.message}`
      );
    }
  }
}
