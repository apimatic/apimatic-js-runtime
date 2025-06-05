import { Schema } from '../schema';
import {
  isNumericString,
  coerceNumericStringToNumber,
  createSymmetricSchema,
  toValidator,
  constructJSONSchema,
} from '../utils';

function createEnumChecker<T extends string, TEnumValue extends number>(
  enumVariable: { [key in T]: TEnumValue },
  allowForUnknownProps: boolean = false
) {
  const enumValues = Object.values(enumVariable);

  if (allowForUnknownProps) {
    return (value: unknown): value is TEnumValue => isNumericString(value);
  } else {
    return (value: unknown): value is TEnumValue =>
      isNumericString(value) &&
      enumValues.includes(coerceNumericStringToNumber(value));
  }
}

/**
 * Create a schema for a number enumeration.
 */
export function numberEnum<T extends string, TEnumValue extends number>(
  enumVariable: { [key in T]: TEnumValue },
  allowForUnknownProps: boolean = false
): Schema<TEnumValue, TEnumValue> {
  const validate = toValidator(
    createEnumChecker(enumVariable, allowForUnknownProps)
  );

  const enumValues = Object.values(enumVariable).filter(
    (v): v is number => typeof v === 'number'
  );
  return createSymmetricSchema({
    type: `Enum<${enumValues.join(',')}>`,
    map: coerceNumericStringToNumber as (value: TEnumValue) => TEnumValue,
    validate,
    toJSONSchema: () => constructJSONSchema({
      enum: enumValues,
    }),
  });
}
