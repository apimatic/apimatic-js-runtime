import { Schema } from '../schema';
import { constructJSONSchema, createSymmetricSchema, identityFn } from '../utils';

/**
 * Create an unknown schema.
 *
 * The unknown schema allows any value.
 */
export function unknown(): Schema<unknown, unknown> {
  return createSymmetricSchema({
    type: 'unknown',
    validate: () => [],
    map: identityFn,
    toJSONSchema: () => constructJSONSchema({}),
  });
}
