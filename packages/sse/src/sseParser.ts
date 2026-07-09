import { RawSseEvent } from './sseTypes';

/** Incremental parser for `text/event-stream` (WHATWG server-sent events). */
export class SseParser {
  private textBuffer = '';
  private dataBuffer: string | undefined;
  private eventTypeBuffer = '';
  private lastEventIdBuffer: string | undefined;
  private retryMs: number | undefined;
  private bomChecked = false;
  private eof = false;
  private scanFrom = 0;
  private decoder = new TextDecoder('utf-8');

  /** The most recent `id:` value seen. */
  public get lastEventId(): string | undefined {
    return this.lastEventIdBuffer;
  }

  /** The most recent `retry:` value seen, in milliseconds. */
  public get retry(): number | undefined {
    return this.retryMs;
  }

  /** Feeds one chunk from the wire and returns any events it completes. */
  public feed(chunk: Uint8Array | string): RawSseEvent[] {
    if (typeof chunk === 'string') {
      this.textBuffer += chunk;
    } else {
      this.textBuffer += this.decoder.decode(chunk, { stream: true });
    }
    if (!this.bomChecked && this.textBuffer.length > 0) {
      if (this.textBuffer.charCodeAt(0) === 0xfeff) {
        this.textBuffer = this.textBuffer.slice(1);
      }
      this.bomChecked = true;
    }
    return this.processBuffer();
  }

  /** Signals end of stream and returns any final event it completes. */
  public end(): RawSseEvent[] {
    this.textBuffer += this.decoder.decode();
    this.eof = true;
    const events = this.processBuffer();
    this.textBuffer = '';
    this.dataBuffer = undefined;
    this.eventTypeBuffer = '';
    this.scanFrom = 0;
    return events;
  }

  private processBuffer(): RawSseEvent[] {
    const events: RawSseEvent[] = [];
    const buffer = this.textBuffer;
    let start = 0;

    while (start < buffer.length) {
      // The prefix before `scanFrom` was already searched on a previous feed
      // and holds no unprocessed line terminator, so resume the search there
      // instead of rescanning the whole buffer (which is O(n^2) for a single
      // large frame split across many chunks).
      const from = start > this.scanFrom ? start : this.scanFrom;
      const cr = buffer.indexOf('\r', from);
      const lf = buffer.indexOf('\n', from);
      let lineEnd: number;
      let nextStart: number;

      if (cr === -1 && lf === -1) {
        this.scanFrom = buffer.length;
        break;
      } else if (cr !== -1 && (lf === -1 || cr < lf)) {
        // A trailing CR may be the first half of a CRLF split across chunks.
        if (cr === buffer.length - 1 && !this.eof) {
          this.scanFrom = cr;
          break;
        }
        lineEnd = cr;
        nextStart = buffer.charAt(cr + 1) === '\n' ? cr + 2 : cr + 1;
      } else {
        lineEnd = lf;
        nextStart = lf + 1;
      }

      const line = buffer.slice(start, lineEnd);
      start = nextStart;
      this.scanFrom = start;

      const event = this.processLine(line);
      if (event !== undefined) {
        events.push(event);
      }
    }

    this.textBuffer = buffer.slice(start);
    // `scanFrom` was tracked against the pre-slice buffer; rebase it onto the
    // retained tail so the next feed resumes at the right place.
    this.scanFrom = this.scanFrom > start ? this.scanFrom - start : 0;
    return events;
  }

  private processLine(line: string): RawSseEvent | undefined {
    if (line === '') {
      return this.dispatchEvent();
    }
    if (line.charAt(0) === ':') {
      return undefined;
    }

    let field: string;
    let value: string;
    const colon = line.indexOf(':');
    if (colon === -1) {
      field = line;
      value = '';
    } else {
      field = line.slice(0, colon);
      value = line.slice(colon + 1);
      if (value.charAt(0) === ' ') {
        value = value.slice(1);
      }
    }

    switch (field) {
      case 'data':
        this.dataBuffer =
          this.dataBuffer === undefined
            ? value
            : `${this.dataBuffer}\n${value}`;
        break;
      case 'event':
        this.eventTypeBuffer = value;
        break;
      case 'id':
        if (value.indexOf('\u0000') === -1) {
          this.lastEventIdBuffer = value;
        }
        break;
      case 'retry':
        if (/^\d+$/.test(value)) {
          this.retryMs = parseInt(value, 10);
        }
        break;
      default:
        break;
    }
    return undefined;
  }

  private dispatchEvent(): RawSseEvent | undefined {
    const data = this.dataBuffer;
    const eventType = this.eventTypeBuffer;
    this.dataBuffer = undefined;
    this.eventTypeBuffer = '';

    if (data === undefined) {
      return undefined;
    }
    return {
      data,
      event: eventType === '' ? undefined : eventType,
      id: this.lastEventIdBuffer,
      retry: this.retryMs,
    };
  }
}
