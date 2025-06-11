import { stringEnum, validateAndMap, validateAndUnmap } from '../../src';

describe('String Enum', () => {
  enum SampleStringEnum {
    Hearts = '_hearts',
    Spades = '_spades',
    Clubs = '_clubs',
    Diamonds = '_diamonds',
  }
  describe('Mapping', () => {
    it('should map unknown string value in enum', () => {
      const input = 'unknown';
      const output = validateAndMap(
        input as any,
        stringEnum(SampleStringEnum, true)
      );
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe('unknown');
    });

    it('should map enum', () => {
      const input = '_hearts';
      const output = validateAndMap(input as any, stringEnum(SampleStringEnum));
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(SampleStringEnum.Hearts);
    });

    it('should fail on invalid value', () => {
      const input = 'invalid value';
      const output = validateAndMap(input as any, stringEnum(SampleStringEnum));
      expect(output.errors).toBeTruthy();
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              "invalid value",
            ],
            "message": "Expected value to be of type 'Enum<\\"_hearts\\",\\"_spades\\",\\"_clubs\\",\\"_diamonds\\">' but found 'string'.

        Given value: \\"invalid value\\"
        Type: 'string'
        Expected type: 'Enum<\\"_hearts\\",\\"_spades\\",\\"_clubs\\",\\"_diamonds\\">'",
            "path": Array [],
            "type": "Enum<\\"_hearts\\",\\"_spades\\",\\"_clubs\\",\\"_diamonds\\">",
            "value": "invalid value",
          },
        ]
      `);
    });
  });
  describe('Unmapping', () => {
    it('should map enum', () => {
      const input = SampleStringEnum.Hearts;
      const output = validateAndUnmap(input, stringEnum(SampleStringEnum));
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe('_hearts');
    });

    it('should fail on invalid value', () => {
      const input = 'invalid value';
      const output = validateAndUnmap(
        input as any,
        stringEnum(SampleStringEnum)
      );
      expect(output.errors).toBeTruthy();
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              "invalid value",
            ],
            "message": "Expected value to be of type 'Enum<\\"_hearts\\",\\"_spades\\",\\"_clubs\\",\\"_diamonds\\">' but found 'string'.

        Given value: \\"invalid value\\"
        Type: 'string'
        Expected type: 'Enum<\\"_hearts\\",\\"_spades\\",\\"_clubs\\",\\"_diamonds\\">'",
            "path": Array [],
            "type": "Enum<\\"_hearts\\",\\"_spades\\",\\"_clubs\\",\\"_diamonds\\">",
            "value": "invalid value",
          },
        ]
      `);
    });
  });

  describe('To JSON Schema', () => {
    it('should output a valid JSON Schema', () => {
      const schema = stringEnum(SampleStringEnum);
      const jsonSchema = schema.toJSONSchema();

      expect(jsonSchema).toStrictEqual({
        enum: ['_hearts', '_spades', '_clubs', '_diamonds']
      });
    });
  });
});
