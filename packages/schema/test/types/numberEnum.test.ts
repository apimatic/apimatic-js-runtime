import { generateJSONSchema, JSONSchema, numberEnum } from '../../src';
import { META_SCHEMA } from '../../src/jsonSchemaTypes';

describe('Number Enum', () => {
  enum SampleNumberEnum {
    A = 2,
    B = 4,
    C = 8,
    D = 16,
  }

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema', () => {
      const schema = numberEnum(SampleNumberEnum);
      const jsonSchema = generateJSONSchema(schema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: META_SCHEMA,
        enum: [2, 4, 8, 16],
      });
    });
  });
});
