import { pathTemplate, SkipEncode } from '../../src/http/pathTemplate';
import { PathParam } from '../../src/pathParam';
test.each([
  [
    'test number type template parameter',
    345,
    '/rest/v1.0/projects/345/accident_logs',
  ],
  [
    'test boolean true type template parameter',
    true,
    '/rest/v1.0/projects/true/accident_logs',
  ],
  [
    'test boolean false type template parameter',
    false,
    '/rest/v1.0/projects/false/accident_logs',
  ],
  [
    'test boolean false type template parameter',
    [false, true],
    '/rest/v1.0/projects/false/true/accident_logs',
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

    const encodedTemplatePathWithSkipEncoding = pathTemplate`/rest/v1.0/projects/${new SkipEncode(companyIdMap, 'key')}/accident_logs`;
    expect(encodedTemplatePathWithSkipEncoding).toStrictEqual(expectedResult);

    const encodedTemplatePathWithPathParam = pathTemplate`/rest/v1.0/projects/${new PathParam(companyIdMap, 'key')}/accident_logs`;
    expect(encodedTemplatePathWithPathParam).toStrictEqual(expectedResult);
  }
);

it('test string with special characters template parameter', () => {
  const expectedResult = '/rest/v1.0/projects/%24he%5B%5Dllo%25/accident_logs';
  const expectedResultWithSkipEncoding = '/rest/v1.0/projects/$he[]llo%/accident_logs';

  const specialCharString = '$he[]llo%';

  const encodedTemplatePath = pathTemplate`/rest/v1.0/projects/${specialCharString}/accident_logs`;
  const encodedTemplatePathWithPathParam = pathTemplate`/rest/v1.0/projects/${new PathParam(specialCharString, 'key')}/accident_logs`;
  const encodedTemplatePathWithSkipEncoding = pathTemplate`/rest/v1.0/projects/${new SkipEncode(specialCharString, 'key')}/accident_logs`;

  expect(encodedTemplatePath).toStrictEqual(expectedResult);
  expect(encodedTemplatePathWithPathParam).toStrictEqual(expectedResult);
  expect(encodedTemplatePathWithSkipEncoding).toStrictEqual(expectedResultWithSkipEncoding);
});
