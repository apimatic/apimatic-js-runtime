import { SseError } from './sseError';

/** The server stalled between frames longer than the read timeout. */
export class SseTimeoutError extends SseError {
  /** The idle window (ms) that elapsed without a frame arriving. */
  public readonly idleTimeoutMs: number;

  constructor(idleTimeoutMs: number) {
    super(
      `SSE stream idle timeout exceeded (${idleTimeoutMs}ms without a frame). ` +
        'This bounds only the wait for the server, not consumer processing time.'
    );
    this.idleTimeoutMs = idleTimeoutMs;
  }
}
