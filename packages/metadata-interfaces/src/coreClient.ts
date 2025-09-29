/**
 * Branded type to represent the core client instance.
 * This ensures type safety without exposing the internal structure of the client.
 */
export type CoreClient = object & { readonly __brand: unique symbol };
