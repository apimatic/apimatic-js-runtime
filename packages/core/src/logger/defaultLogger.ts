import { LogLevel, LoggerInterface } from '@apimatic/core-interfaces';

export class ConsoleLogger implements LoggerInterface {
  public log(
    level: LogLevel,
    message: string,
    params: Record<string, any>
  ): void {
    const formattedMessage = formatMessage(message, params);
    // tslint:disable-next-line:no-console
    console.log(level + ': ' + formattedMessage);
  }
}

function formatMessage(msg: string, obj: Record<string, any>): string {
  // Use a regular expression to match placeholders in the message string
  const regex = /\${([^}]+)}/g;

  // Use a function to perform the replacement safely
  const formattedMsg = msg.replace(regex, (match, key) => {
    // Check if the key exists in the object
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      // If the value is an object, stringify it
      if (typeof value === 'object') {
        return JSON.stringify(value);
      } else {
        return String(value);
      }
    }
    // If the key doesn't exist, return the original placeholder
    return match;
  });

  return formattedMsg;
}
