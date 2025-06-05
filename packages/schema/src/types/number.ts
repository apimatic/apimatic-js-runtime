import { Schema } from '../schema';
import {
  coerceNumericStringToNumber,
  constructJSONSchema,
  createSymmetricSchema,
  isNumericString,
  toValidator,
} from '../utils';

/** Create a number schema. */
export function number(): Schema<number, number> {
  return createSymmetricSchema({
    type: 'number',
    validate: toValidator(isNumericString),
    map: coerceNumericStringToNumber as (arg: number) => number,
    toJSONSchema: () => constructJSONSchema({
      type: 'number',
    }),
  });
}
