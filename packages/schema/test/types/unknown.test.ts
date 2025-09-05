import {
  generateJSONSchema,
  JSONSchema,
  unknown,
  validateAndMap,
  validateAndUnmap,
} from '../../src';
import { META_SCHEMA } from '../../src/jsonSchemaTypes';

describe('Unknown', () => {
  describe('Mapping', () => {
    it('should map', () => {
      const input = 'hello world';
      const schema = unknown();
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });
  });
  describe('Unmapping', () => {
    it('should map', () => {
      const input = 'hello world';
      const schema = unknown();
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema', () => {
      const schema = unknown();
      const jsonSchema = generateJSONSchema(schema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: META_SCHEMA,
      });
    });
  });
});
