import {
  SchemaValidationError,
  SchemaContext,
} from '../../../schema/lib/schema';
import { ResponseValidationError } from '../../../core/src/errors/responseValidationError';
import { ApiResponse } from '../../src/apiResponse';
describe('Test Response Validation Instance', () => {
  it('tests ResponseValidationError with a single argument', () => {
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

    const response: ApiResponse<string> = {
      request: {
        method: 'GET',
        url: 'url',
        headers: { 'test-header': 'test-value' },
        body: {
          content: 'testBody',
          type: 'text',
        },
        responseType: 'text',
        auth: { username: 'test-username', password: 'test-password' },
      },
      statusCode: 200,
      headers: { 'test-header': 'test-value' },
      body: '{ \'name\': \'maryam\', \'id\' : \'1234\'}',
      result: '',
    };
    const responseValidationError = new ResponseValidationError(response, [
      error,
    ]);
    expect(responseValidationError.message).toEqual(
      `The response did not match the response schema.\n\nExpected value to be of type string but found number.`
    );
  });

  it('tests ResponseValidationError with multiple arguments', () => {
    const name = 'maryam';
    const id = 123456;

    const context = {
      value: id,
      type: 'string',
      path: [id],
      branch: [],
    } as SchemaContext;

    const error: SchemaValidationError = {
      ...context,
      message: `Expected value to be of type ${
        context.type
      } but found ${typeof context.value}.`,
    };

    const context1 = {
      value: name,
      type: 'number',
      path: [name],
      branch: [],
    } as SchemaContext;

    const error1: SchemaValidationError = {
      ...context,
      message: `Expected value to be of type ${
        context1.type
      } but found ${typeof context1.value}.`,
    };

    const response: ApiResponse<string> = {
      request: {
        method: 'GET',
        url: 'url',
        headers: { 'test-header': 'test-value' },
        body: {
          content: 'testBody',
          type: 'text',
        },
        responseType: 'text',
        auth: { username: 'test-username', password: 'test-password' },
      },
      statusCode: 200,
      headers: { 'test-header': 'test-value' },
      body: `{ 'name': ${name}, 'id' : ${id} }`,
      result: '',
    };
    const responseValidationError = new ResponseValidationError(response, [
      error,
      error1,
    ]);
    expect(responseValidationError.message).toEqual(
      `The response did not match the response schema.\n\n> Issue #1\n\nExpected value to be of type string but found number.\n\n> Issue #2\n\nExpected value to be of type number but found string.`
    );
  });

  it('tests ArgumentsValidationError with no arguments', () => {
    const name = 'maryam';
    const id = 123456;
    const response: ApiResponse<string> = {
      request: {
        method: 'GET',
        url: 'url',
        headers: { 'test-header': 'test-value' },
        body: {
          content: 'testBody',
          type: 'text',
        },
        responseType: 'text',
        auth: { username: 'test-username', password: 'test-password' },
      },
      statusCode: 200,
      headers: { 'test-header': 'test-value' },
      body: `{ 'name': ${name}, 'id' : ${id} }`,
      result: '',
    };
    const responseValidationError = new ResponseValidationError(response, []);
    expect(responseValidationError.message).toEqual(
      `The response did not match the response schema.`
    );
  });
});
