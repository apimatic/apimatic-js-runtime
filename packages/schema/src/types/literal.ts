import { Schema } from '../schema';
import { createSymmetricSchema, literalToString, toValidator } from '../utils';

/**
 * Create a literal schema.
 *
 * This schema always unmaps/maps to the constant value provided in the schema,
 * regardless of the value being mapped/unmapped. The validation always passes.
 */
export function literal<T extends boolean>(literalValue: T): Schema<T, T>;
export function literal<T extends number>(literalValue: T): Schema<T, T>;
export function literal<T extends string>(literalValue: T): Schema<T, T>;
export function literal<T>(literalValue: T): Schema<T, T>;
export function literal<T>(literalValue: T): Schema<T, T> {
  const validate = (value: unknown): value is T => literalValue === value;
  const map = () => literalValue;
  return createSymmetricSchema({
    type: `Literal<${literalToString(literalValue)}>`,
    validate: toValidator(validate),
    map,
    toJSONSchema: (context) => ({
      ...context,
      partialJsonSchema: {
        // `const` literals can be any type
        // https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#name-const
        const: literalValue as any,
      },
    }),
  });
}
