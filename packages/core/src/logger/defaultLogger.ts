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

const formatMessage = (msg: string, obj: Record<string, any>): string => {
  let formattedMsg = msg;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      // If the value is an object, stringify it
      const placeholder = '${' + key + '}';
      formattedMsg = formattedMsg.replace(placeholder, JSON.stringify(value));
    } else {
      // Replace placeholders with corresponding values
      const placeholder = '${' + key + '}';
      formattedMsg = formattedMsg.replace(placeholder, String(value));
    }
  }
  return formattedMsg;
};
