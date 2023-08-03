import { Schema } from '../schema';
import {
  coerceNumericStringToNumber,
  createSymmetricSchema,
  isNumeric,
  isNumericString,
  toValidator,
} from '../utils';

/** Create a number schema. */
export function number(strict: boolean = false): Schema<number, number> {
  const validator = strict
    ? toValidator(isNumeric)
    : toValidator(isNumericString);
  return createSymmetricSchema({
    type: 'number',
    validate: validator,
    map: coerceNumericStringToNumber as (arg: number) => number,
  });
}
