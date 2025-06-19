import { Schema } from '../schema';
import {
  coerceStringOrNumberToBigInt,
  createSymmetricSchema,
  toValidator,
} from '../utils';

function isValidBigIntValue(value: unknown, strict: boolean): value is bigint {
  return strict
    ? typeof value === 'bigint'
    : typeof value === 'bigint' ||
        typeof value === 'number' ||
        (typeof value === 'string' && /^-?\d+$/.test(value));
}

/** Create a bigint schema */
export function bigint(): Schema<bigint, bigint> {
  return createSymmetricSchema({
    type: 'bigint',
    validate: toValidator(isValidBigIntValue),
    map: coerceStringOrNumberToBigInt as (arg: bigint) => bigint,
    toJSONSchema: () => ({
      type: 'integer',
      format: 'int64', // based on OpenAPI 3.1.0 https://spec.openapis.org/oas/v3.1.0.html#data-types
    }),
  });
}
