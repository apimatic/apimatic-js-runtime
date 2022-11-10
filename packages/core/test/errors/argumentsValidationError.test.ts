import {
  SchemaValidationError,
  SchemaContext,
} from '../../../schema/lib/schema';
import { ArgumentsValidationError } from '../../../core/src/errors/argumentsValidationError';
describe('Test Arguments Validation Instance', () => {
  it('tests ArgumentsValidationError with a single argument', () => {
    const context = {
      value: 123456,
      type: 'string',
      path: [123456],
      branch: [],
    } as SchemaContext;

    const error: SchemaValidationError = {
      ...context,
      message: `Expected value to be of type ${
        context.type
      } but found ${typeof context.value}.`,
    };

    const context1 = {
      value: 'maryam',
      type: 'number',
      path: ['maryam'],
      branch: [],
    } as SchemaContext;

    const error1: SchemaValidationError = {
      ...context,
      message: `Expected value to be of type ${
        context1.type
      } but found ${typeof context1.value}.`,
    };
    const errors = [error, error1] as SchemaValidationError[];
    const argumentsValidationError = new ArgumentsValidationError({
      key1: errors,
    });
    expect(argumentsValidationError.message).toEqual(
      `The following arguments failed validation: key1.\n\n> For argument 'key1':\n\n>> Issue #1\n\nExpected value to be of type string but found number.\n\n>> Issue #2\n\nExpected value to be of type number but found string.`
    );
  });

  it('tests ArgumentsValidationError with multiple arguments', () => {
    const context = {
      value: 123456,
      type: 'string',
      path: [123456],
      branch: [],
    } as SchemaContext;

    const error: SchemaValidationError = {
      ...context,
      message: `Expected value to be of type ${
        context.type
      } but found ${typeof context.value}.`,
    };

    const context1 = {
      value: 'maryam',
      type: 'number',
      path: ['maryam'],
      branch: [],
    } as SchemaContext;

    const error1: SchemaValidationError = {
      ...context,
      message: `Expected value to be of type ${
        context1.type
      } but found ${typeof context1.value}.`,
    };
    const argumentsValidationError = new ArgumentsValidationError({
      key1: [error, error1],
      key2: [error1],
    });
    expect(argumentsValidationError.message).toEqual(
      `The following arguments failed validation: key1, key2.\n\n> For argument 'key1':\n\n>> Issue #1\n\nExpected value to be of type string but found number.\n\n>> Issue #2\n\nExpected value to be of type number but found string.\n\n> For argument 'key2':\n\nExpected value to be of type number but found string.`
    );
  });

  it('tests ArgumentsValidationError with no arguments', () => {
    const argumentsValidationError = new ArgumentsValidationError({});
    expect(argumentsValidationError.message).toEqual(
      'One or more arguments failed validation.'
    );
  });
});
