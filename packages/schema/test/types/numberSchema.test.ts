import { numberEnum, validateAndMap, validateAndUnmap } from '../../src';

describe('Number Enum', () => {
  enum SampleNumberEnum {
    Hearts,
    Spades,
    Clubs,
    Diamonds,
  }
  describe('Mapping', () => {
    it('should map unknown numeric value in enum', () => {
      const input = 5;
      const output = validateAndMap(
        input as any,
        numberEnum(SampleNumberEnum, true)
      );
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(5);
    });

    it('should map unknown numeric string value in enum', () => {
      const input = '5';
      const output = validateAndMap(
        input as any,
        numberEnum(SampleNumberEnum, true)
      );
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(5);
    });

    it('should map enum', () => {
      const input = 0;
      const output = validateAndMap(input as any, numberEnum(SampleNumberEnum));
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(SampleNumberEnum.Hearts);
    });

    it('should map enum from numeric string', () => {
      const input = '0';
      const output = validateAndMap(input as any, numberEnum(SampleNumberEnum));
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(SampleNumberEnum.Hearts);
    });

    it('should fail on invalid value', () => {
      const input = 250;
      const output = validateAndMap(input as any, numberEnum(SampleNumberEnum));
      expect(output.errors).toBeTruthy();
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              250,
            ],
            "message": "Expected value to be of type 'Enum<0,1,2,3>' but found 'number'.

        Given value: 250
        Type: 'number'
        Expected type: 'Enum<0,1,2,3>'",
            "path": Array [],
            "type": "Enum<0,1,2,3>",
            "value": 250,
          },
        ]
      `);
    });

    it('should fail on enum string key', () => {
      const input = 'Hearts';
      const output = validateAndMap(input as any, numberEnum(SampleNumberEnum));
      expect(output.errors).toBeTruthy();
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              "Hearts",
            ],
            "message": "Expected value to be of type 'Enum<0,1,2,3>' but found 'string'.

        Given value: \\"Hearts\\"
        Type: 'string'
        Expected type: 'Enum<0,1,2,3>'",
            "path": Array [],
            "type": "Enum<0,1,2,3>",
            "value": "Hearts",
          },
        ]
      `);
    });
  });
  describe('Unmapping', () => {
    it('should map enum', () => {
      const input = SampleNumberEnum.Hearts;
      const output = validateAndUnmap(input, numberEnum(SampleNumberEnum));
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(0);
    });

    it('should map enum from numeric string', () => {
      const input = '0';
      const output = validateAndUnmap(
        input as any,
        numberEnum(SampleNumberEnum)
      );
      expect(output.errors).toBeFalsy();
      expect((output as any).result).toBe(SampleNumberEnum.Hearts);
    });

    it('should fail on invalid value', () => {
      const input = 250;
      const output = validateAndUnmap(
        input as any,
        numberEnum(SampleNumberEnum)
      );
      expect(output.errors).toBeTruthy();
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              250,
            ],
            "message": "Expected value to be of type 'Enum<0,1,2,3>' but found 'number'.

        Given value: 250
        Type: 'number'
        Expected type: 'Enum<0,1,2,3>'",
            "path": Array [],
            "type": "Enum<0,1,2,3>",
            "value": 250,
          },
        ]
      `);
    });

    it('should fail on enum string key', () => {
      const input = 'Hearts';
      const output = validateAndUnmap(
        input as any,
        numberEnum(SampleNumberEnum)
      );
      expect(output.errors).toBeTruthy();
      expect(output.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "branch": Array [
              "Hearts",
            ],
            "message": "Expected value to be of type 'Enum<0,1,2,3>' but found 'string'.

        Given value: \\"Hearts\\"
        Type: 'string'
        Expected type: 'Enum<0,1,2,3>'",
            "path": Array [],
            "type": "Enum<0,1,2,3>",
            "value": "Hearts",
          },
        ]
      `);
    });
  });
});
