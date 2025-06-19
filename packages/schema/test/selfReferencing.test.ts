import { PartialJSONSchema, validateAndMap } from '../src';
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
    expect(bossSchema.toJSONSchema()).toStrictEqual<PartialJSONSchema>({
      type: 'object',
      properties: {
        promotedAt: {
          type: 'number',
        },
        assistant: {
          type: 'object',
          required: ['department'],
          properties: {
            department: {
              type: 'string',
            },
            boss: {
              type: 'object',
              properties: {
                promotedAt: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    });
  });
});
