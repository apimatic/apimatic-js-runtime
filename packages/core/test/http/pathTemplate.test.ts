import { pathTemplate } from '../../src/http/pathTemplate';
describe('test numer type template parameter', () => {
  test.each([
    [
      'test number type template parameter',
      345,
      '/rest/v1.0/projects/345/accident_logs',
    ],
    [
      'test string type template parameter',
      '345',
      '/rest/v1.0/projects/345/accident_logs',
    ],
    [
      'test bigInt type template parameter',
      -9532532599932,
      '/rest/v1.0/projects/-9532532599932/accident_logs',
    ],
    [
      'test number array type template parameter',
      [345, 346, 347],
      '/rest/v1.0/projects/345/346/347/accident_logs',
    ],
    [
      'test string array type template parameter',
      ['A', 'B', 'C'],
      '/rest/v1.0/projects/A/B/C/accident_logs',
    ],
    [
      'test bigInt array type template parameter',
      [9532532599932, 9532532599932, -9532532599932],
      '/rest/v1.0/projects/9532532599932/9532532599932/-9532532599932/accident_logs',
    ],
    [
      'test unknown parameter',
      {
        'first-name': 'Maryam',
        'last-name': 'Adnan',
        Profession: 'Software Engineer',
      },
      '/rest/v1.0/projects//accident_logs',
    ],
  ])(
    '%s',
    (
      _: string,
      companyIdMap:
        | number
        | string
        | bigint
        | number[]
        | string[]
        | Array<bigint>
        | unknown,
      expectedResult: string
    ) => {
      const encodedTemplatePath = pathTemplate`/rest/v1.0/projects/${companyIdMap}/accident_logs`;
      expect(encodedTemplatePath).toStrictEqual(expectedResult);
    }
  );
});
