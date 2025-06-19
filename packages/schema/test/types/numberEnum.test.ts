import { generateJSONSchema, type JSONSchema, numberEnum } from '../../src';

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
        $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
        enum: [2, 4, 8, 16],
      });
    });
  });
});
