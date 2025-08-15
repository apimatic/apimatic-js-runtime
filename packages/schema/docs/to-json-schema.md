# Conversion to JSON Schema

The `schema` library allows you to take any schema that can be described using functions and convert that into a JSON Schema that is compatible with OpenAPI 3.1.0 which [extends JSON Schema draft 2020-12](https://spec.openapis.org/oas/v3.1.0.html#data-types).

## How to Use

Here's an example where we convert a simple object schema to a JSON Schema object.

```ts
import {
  object,
  string,
  optional,
  number,
  generateJSONSchema,
} from '@apimatic/schema';

// Given a schema that looks like:
const userSchema = object({
  id: ['id', string()],
  age: ['age', optional(number())],
});

// Convert it as follows:
const jsonSchema = generateJSONSchema(userSchema);
```

The output object will look like this:

```ts
{
    $schema: 'https://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['id'],
    properties: {
        id: {
            type: 'string',
        },
        age: {
            type: 'number',
        },
    },
}
```

Note that this is a **JavaScript object**. Not a JSON string.

For more examples, check out the unit tests for the schemas you are interested in such as [`array`](../test/types/array.test.ts).

## How it Works

Every `Schema` type(e.g. `number`, `nullable`, `object`) has a `toJSONSchema` method which returns a partial JSON Schema containing the relevant properties and values. Schemas make up a tree(or graph for recursive schemas). When you call `generateJSONSchema`, each `toJSONSchema` method in the schema tree will be called. Each returned partial JSON Schema is combined to form the final object and return it.

For recursive schemas or `oneOf`/`anyOf` with discriminators, a special context object is passed in and used to keep track of which schemas have been traversed. At the end, the context is used to construct the schema using `$defs` and `$ref` properties.

## Standards Compliance

Note that the type of the JSON Schema object is the draft 7-based `JSONSchema7` type from the `@types/json-schema` package. The reason for this is because this type is commonly used across many different JSON-related libraries. In order to keep compatibility with different libraries while respecting OpenAPI 3.1.0, the following schemas are given special consideration:

- `oneOf`/`anyOf` with discriminator: The `discriminator` property is used as defined in OpenAPI 3.1.0. `discriminator` doesn't exist in the JSON Schema spec.
- `discriminatedUnion`: This schema is used for schemas in an inheritance heirarchy. The implementation is identical to `anyOf` with discriminator.
- `bigint`: Uses `integer` type with `format` set to `int64`. `bigint` doesn't exist in the JSON Schema spec.
- `nullable`: Implemented as `oneOf` between the base schema and a null type. This is preferred in draft 2020-12 which is used in OpenAPI 3.1.0.

## Gotchas/Important Notes

- The output of `generateJSONSchema` is a **JavaScript object** which is not the same thing as a serialized JSON string. If you wish, you may serialize it into a JSON string with `JSON.stringify()`.

- The `$defs` property is used extensively to keep track of which schemas have been traversed. This is a nice solution for dealing with recursion. Without `$defs`, we would have to output the recursive part of the schema only once and probably use `null` or an empty object at the point where the schema starts. This would be a lossy conversion since the output schema would no longer be recursive.

Compare the following:

```json
{
  "$defs": {
    "schema1": {
      "type": "object",
      "properties": {
        "recurse": {
          "$ref": "#/$defs/schema1"
        }
      }
    }
  },
  "type": "object",
  "properties": {
    "prop": {
      "$ref": "#/$defs/schema1"
    }
  }
}
```

```json
{
  "type": "object",
  "properties": {
    "prop": {
      "type": "object",
      "properties": {
        "recurse": {}
      }
    }
  }
}
```

- Since this library does not currently take the names of schemas as input, their names in `$defs` are auto-generated as `schema1`, `schema2`, `schema3`.

- `optional` by itself does not do any actual conversion to JSON Schemas. It is meant to be used in `object` schemas and therefore the logic for `optional` schemas is encapsulated in `internalObject`'s `toJSONSchema` method.
