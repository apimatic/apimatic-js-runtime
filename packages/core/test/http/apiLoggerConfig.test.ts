import { LogLevel } from '@apimatic/core-interfaces';
import {
  DEFAULT_LOGGING_OPTIONS,
  mergeLoggingOptions,
} from '../../src/logger/defaultLoggingConfiguration';
import { PartialLoggingOptions } from '../../src/logger/loggingOptions';

describe('Creating logging configuration with defaults', () => {
  describe('Setting root-level options', () => {
    it('should fallback to defaults when no option is provided', () => {
      const options: PartialLoggingOptions = {};

      const result = mergeLoggingOptions(options);

      expect(result).toStrictEqual(DEFAULT_LOGGING_OPTIONS);
    });

    it('should set one option', () => {
      const options: PartialLoggingOptions = {
        logLevel: LogLevel.Debug,
      };

      const result = mergeLoggingOptions(options);

      expect(result).toStrictEqual({
        ...DEFAULT_LOGGING_OPTIONS,
        logLevel: LogLevel.Debug,
      });
    });

    it('should set multiple options', () => {
      const options: PartialLoggingOptions = {
        logLevel: LogLevel.Debug,
        maskSensitiveHeaders: false,
      };

      const result = mergeLoggingOptions(options);

      expect(result).toStrictEqual({
        ...DEFAULT_LOGGING_OPTIONS,
        logLevel: LogLevel.Debug,
        maskSensitiveHeaders: false,
      });
    });

    it('should not mutate options argument', () => {
      const options: PartialLoggingOptions = {
        logLevel: LogLevel.Debug,
      };
      const optionsCopy = { ...options };

      mergeLoggingOptions(options);

      expect(options).toStrictEqual(optionsCopy);
    });

    it('should allow providing custom defaults', () => {
      const customDefaults = mergeLoggingOptions({
        logLevel: LogLevel.Debug,
      });

      const result = mergeLoggingOptions(
        {
          maskSensitiveHeaders: false,
        },
        customDefaults
      );

      expect(result).toStrictEqual({
        ...DEFAULT_LOGGING_OPTIONS,
        logLevel: LogLevel.Debug,
        maskSensitiveHeaders: false,
      });
    });
  });

  describe('Setting nested options', () => {
    it('should fallback to defaults when no option is provided', () => {
      const options: PartialLoggingOptions = {
        logRequest: {},
      };

      const result = mergeLoggingOptions(options);

      expect(result).toStrictEqual(DEFAULT_LOGGING_OPTIONS);
    });

    it('should set one primitive nested option', () => {
      const options: PartialLoggingOptions = {
        logRequest: {
          logBody: true,
        },
      };

      const result = mergeLoggingOptions(options);

      expect(result).toStrictEqual({
        ...DEFAULT_LOGGING_OPTIONS,
        logRequest: { ...DEFAULT_LOGGING_OPTIONS.logRequest, logBody: true },
      });
    });

    it('should set array type options', () => {
      const options: PartialLoggingOptions = {
        logRequest: {
          headerToInclude: ['X-Cache'],
        },
      };

      const result = mergeLoggingOptions(options);

      expect(result).toStrictEqual({
        ...DEFAULT_LOGGING_OPTIONS,
        logRequest: {
          ...DEFAULT_LOGGING_OPTIONS.logRequest,
          headerToInclude: ['X-Cache'],
        },
      });
    });
  });
});
