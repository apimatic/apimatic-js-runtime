import { Schema } from '../schema';
import {
  coerceStringOrNumberToBigInt,
  createSymmetricSchema,
  toValidator,
} from '../utils';

function isValidBigIntValue(value: unknown): value is bigint {
  return (
    typeof value === 'bigint' ||
    typeof value === 'number' ||
    (typeof value === 'string' && /^-?\d+$/.test(value))
  );
}

function isValidStrictBigIntValue(value: unknown): value is bigint {
  return typeof value === 'bigint';
}
/** Create a bigint schema */
export function bigint(strict: boolean = false): Schema<bigint, bigint> {
  const validator = strict
    ? toValidator(isValidStrictBigIntValue)
    : toValidator(isValidBigIntValue);
  return createSymmetricSchema({
    type: 'bigint',
    validate: validator,
    map: coerceStringOrNumberToBigInt as (arg: bigint) => bigint,
  });
}
