import { numberEnum, validateAndMap } from '../../src';

describe('Number Enum', () => {
  enum SampleNumberEnum {
    Hearts = 1,
    Spades,
    Clubs,
    Diamonds,
  }
  describe('Mapping', () => {
    it('should map known number to enum member', () => {
      const input = 3;
      const output = validateAndMap(input as any, numberEnum(SampleNumberEnum));
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(SampleNumberEnum.Clubs);
    });

    it('should fail for unknown number', () => {
      const input = 5;
      const output = validateAndMap(input as any, numberEnum(SampleNumberEnum));

      expect(output.errors).toBeTruthy();
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              5,
            ],
            "message": "Expected value to be of type 'Enum<1,2,3,4>' but found 'number'.

        Given value: 5
        Type: 'number'
        Expected type: 'Enum<1,2,3,4>'",
            "path": Array [],
            "type": "Enum<1,2,3,4>",
            "value": 5,
          },
        ]
      `);
    });

    it('should map unknown number when allowing unknown props', () => {
      const input: SampleNumberEnum | number = 5;
      const output = validateAndMap(
        input as any,
        numberEnum(SampleNumberEnum, true)
      );

      expect(output.errors).toBeFalsy();
      if (output.errors) {
        throw new Error('This check is for type narrowing.');
      }

      expect(output.result).toBe(5);
    });
  });
});
