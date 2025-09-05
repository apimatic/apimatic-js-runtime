import {
  bigint,
  generateJSONSchema,
  JSONSchema,
  validateAndMap,
  validateAndUnmap,
} from '../../src';
import { META_SCHEMA } from '../../src/jsonSchemaTypes';
describe('bigint', () => {
  describe('Mapping', () => {
    it('should accept number in bigint constructor', () => {
      const input = BigInt(9532532599932);
      const schema = bigint();
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept negative number bigint constructor', () => {
      const input = BigInt(-9532532599932);
      const schema = bigint();
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept string in bigint constructor', () => {
      const input = BigInt('9532532599932222222');
      const schema = bigint();
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept negative numeric string in bigint constructor', () => {
      const input = BigInt('-9532532599932222222');
      const schema = bigint();
      const output = validateAndMap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept bigint string', () => {
      const input = '9532532599932222222';
      const schema = bigint();
      const output = validateAndMap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(BigInt(input));
    });

    it('should accept negative bigint string', () => {
      const input = '-9532532599932222222';
      const schema = bigint();
      const output = validateAndMap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(BigInt(input));
    });

    it('should accept number', () => {
      const input = 9532532599932;
      const schema = bigint();
      const output = validateAndMap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(BigInt(input));
    });

    it('should accept negative number', () => {
      const input = -9532532599932;
      const schema = bigint();
      const output = validateAndMap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(BigInt(input));
    });

    it('should fail on other types', () => {
      const input = { a: true, b: BigInt('9532532599932') };
      const schema = bigint();
      const output = validateAndMap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              Object {
                "a": true,
                "b": 9532532599932n,
              },
            ],
            "message": "Expected value to be of type 'bigint' but found 'object'.

        Given value: {\\"a\\":true,\\"b\\":\\"9532532599932\\"}
        Type: 'object'
        Expected type: 'bigint'",
            "path": Array [],
            "type": "bigint",
            "value": Object {
              "a": true,
              "b": 9532532599932n,
            },
          },
        ]
      `);
    });
  });

  describe('Unmapping', () => {
    it('should accept number in bigint constructor', () => {
      const input = BigInt(9532532599932);
      const schema = bigint();
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept negative number in bigint constructor', () => {
      const input = BigInt(-9532532599932);
      const schema = bigint();
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept bigint string in constructor', () => {
      const input = BigInt('9532532599932222222');
      const schema = bigint();
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept negative bigint string in constructor', () => {
      const input = BigInt('-9532532599932222222');
      const schema = bigint();
      const output = validateAndUnmap(input, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(input);
    });

    it('should accept bigint string', () => {
      const input = '9532532599932222222';
      const schema = bigint();
      const output = validateAndUnmap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(BigInt(input));
    });

    it('should accept negative bigint string', () => {
      const input = '-9532532599932222222';
      const schema = bigint();
      const output = validateAndUnmap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(BigInt(input));
    });

    it('should accept number', () => {
      const input = 9532532599932;
      const schema = bigint();
      const output = validateAndUnmap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(BigInt(input));
    });

    it('should accept negative number', () => {
      const input = -9532532599932;
      const schema = bigint();
      const output = validateAndUnmap(input as any, schema);
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(BigInt(input));
    });

    it('should fail on other types', () => {
      const input = true;
      const schema = bigint();
      const output = validateAndUnmap(input as any, schema);
      expect((output as any).result).toBeUndefined();
      expect(output.errors).toHaveLength(1);
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              true,
            ],
            "message": "Expected value to be of type 'bigint' but found 'boolean'.

        Given value: true
        Type: 'boolean'
        Expected type: 'bigint'",
            "path": Array [],
            "type": "bigint",
            "value": true,
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema', () => {
      const schema = bigint();
      const jsonSchema = generateJSONSchema(schema);

      expect(jsonSchema).toStrictEqual<JSONSchema>({
        $schema: META_SCHEMA,
        type: 'integer',
        format: 'int64',
      });
    });
  });
});
