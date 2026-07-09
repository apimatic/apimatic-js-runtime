/** Base class for errors thrown while iterating a server-sent event stream. */
export abstract class SseError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }
}
