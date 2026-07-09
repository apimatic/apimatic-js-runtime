import { SseError } from './sseError';

/** A frame's payload could not be decoded into the expected type. */
export class SseDecodeError extends SseError {
  /** The raw frame payload that failed to decode. */
  public readonly rawFrame: string;
  /** The underlying decode failure. */
  public readonly cause: unknown;

  constructor(rawFrame: string, cause: unknown) {
    super(
      'Failed to decode a Server-Sent Events frame. ' +
        'See rawFrame for the offending payload.'
    );
    this.rawFrame = rawFrame;
    this.cause = cause;
  }
}
