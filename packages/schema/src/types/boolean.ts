import { Schema } from '../schema';
import { createSymmetricSchema, toValidator } from '../utils';

function isValidBooleanStringValue(value: unknown): boolean {
  return (
    typeof value === 'boolean' ||
    (typeof value === 'string' && (value === 'true' || value === 'false'))
  );
}

function isValidBooleanValue(value: unknown): boolean {
  return typeof value === 'boolean';
}

/** Create a boolean schema. */
export function boolean(strict: boolean = false): Schema<boolean, boolean> {
  const validator = strict
    ? toValidator(isValidBooleanValue)
    : toValidator(isValidBooleanStringValue);
  return createSymmetricSchema({
    type: 'boolean',
    validate: validator,
    map: (value) => (typeof value === 'boolean' ? value : value === 'true'),
  });
}
