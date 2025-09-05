import type { JSONSchema } from '../src';
import { generateJSONSchema, lazy, strictObject, validateAndMap } from '../src';
import { META_SCHEMA } from '../src/jsonSchemaTypes';
import { Boss, bossSchema } from './bossSchema';

describe('Self-Referencing', () => {
  it('should map self-referencing schemas', () => {
    const input: Boss = {
      promotedAt: 123123,
      assistant: {
        department: 'IT',
      },
    };
    const output = validateAndMap(input, bossSchema);
    expect(output.errors).toBeFalsy();
    expect((output as any).result).toStrictEqual({
      promotedAt: 123123,
      assistant: {
        department: 'IT',
      },
    });
  });

  it('should generate valid JSON Schema for self-referencing schemas', () => {
    expect(generateJSONSchema(bossSchema)).toStrictEqual<JSONSchema>({
      $schema: META_SCHEMA,
      type: 'object',
      properties: {
        promotedAt: {
          type: 'number',
        },
        assistant: {
          $ref: '#/$defs/schema1',
        },
      },
      additionalProperties: false,
      $defs: {
        schema1: {
          type: 'object',
          required: ['department'],
          properties: {
            department: {
              type: 'string',
            },
            boss: {
              $ref: '#',
            },
          },
          additionalProperties: false,
        },
      },
    });
  });

  it('should generate valid JSON Schema for object containing self-referencing schemas', () => {
    const schema = strictObject({
      senior: ['senior', lazy(() => bossSchema)],
    });

    expect(generateJSONSchema(schema)).toStrictEqual<JSONSchema>({
      $schema: META_SCHEMA,
      type: 'object',
      properties: {
        senior: {
          $ref: '#/$defs/schema1',
        },
      },
      required: ['senior'],
      additionalProperties: false,
      $defs: {
        schema1: {
          type: 'object',
          properties: {
            promotedAt: {
              type: 'number',
            },
            assistant: {
              $ref: '#/$defs/schema2',
            },
          },
          additionalProperties: false,
        },
        schema2: {
          type: 'object',
          required: ['department'],
          properties: {
            department: {
              type: 'string',
            },
            boss: {
              $ref: '#/$defs/schema1',
            },
          },
          additionalProperties: false,
        },
      },
    });
  });
});
