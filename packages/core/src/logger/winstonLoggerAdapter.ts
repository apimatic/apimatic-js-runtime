import winston from 'winston';

export interface Logger {
  trace(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  [x: string]: any;
}

export class WinstonLoggerAdapter implements Logger {
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  public trace(message?: any, ...optionalParams: any[]): void {
    this.logger.log('trace', message, ...optionalParams);
  }

  public debug(message?: any, ...optionalParams: any[]): void {
    this.logger.log('debug', message, ...optionalParams);
  }

  public info(message?: any, ...optionalParams: any[]): void {
    this.logger.log('info', message, ...optionalParams);
  }

  public warn(message?: any, ...optionalParams: any[]): void {
    this.logger.log('warn', message, ...optionalParams);
  }

  public error(message?: any, ...optionalParams: any[]): void {
    this.logger.log('error', message, ...optionalParams);
  }
}
