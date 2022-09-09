import {
  urlEncodeObject,
  ArrayPrefixFunction,
  indexedPrefix,
  tabPrefix,
  unindexedPrefix,
  plainPrefix,
  pipePrefix,
  commaPrefix,
} from '../../src/http/queryString';

describe('test query encoding', () => {
  test.each([
    [
      'test indexed prefix format',
      {
        dependendIds: [1, 2, 3],
        dependentNames: ['ab', 'bc\\tbc', 'cd', 'ef'],
      },
      indexedPrefix,
      `dependendIds[0]=1&dependendIds[1]=2&dependendIds[2]=3&dependentNames[0]=ab&dependentNames[1]=bc\\tbc&dependentNames[2]=cd&dependentNames[3]=ef`,
    ],
    [
      'test unindexed prefix format',
      {
        dependendIds: [1, 2, 3],
        dependentNames: ['ab', 'bc\\tbc', 'cd', 'ef'],
      },
      unindexedPrefix,
      `dependendIds[]=1&dependendIds[]=2&dependendIds[]=3&dependentNames[]=ab&dependentNames[]=bc\\tbc&dependentNames[]=cd&dependentNames[]=ef`,
    ],
    [
      'test plane prefix format',
      { dependendIds: [1, 2, 3], dependentNames: ['ab', 'bc', 'cd', 'ef'] },
      plainPrefix,
      `dependendIds=1&dependendIds=2&dependendIds=3&dependentNames=ab&dependentNames=bc\\tbc&dependentNames=cd&dependentNames=ef`,
    ],
    [
      'test comma prefix format',
      { dependendIds: [1, 2, 3], dependentNames: ['ab', 'bc', 'cd', 'ef'] },
      commaPrefix,
      `dependendIds=1,2,3&dependentNames=ab,bc,cd,ef`,
    ],
    [
      'test tab prefix format',
      { dependendIds: [1, 2, 3], dependentNames: ['ab', 'bc', 'cd', 'ef'] },
      tabPrefix,
      `dependendIds=1\t2\t3&dependentNames=ab\tbc\tcd\tf`,
    ],
    [
      'test pipe prefix format',
      { dependendIds: [1, 2, 3], dependentNames: ['ab', 'bc', 'cd', 'ef'] },
      pipePrefix,
      `dependendIds=1|2|3&dependentNames=ab|bc|cd|ef`,
    ],
  ])(
    '%s',
    (
      _: string,
      obj: Record<string, unknown>,
      prefixFormat: ArrayPrefixFunction,
      expectedResult: string
    ) => {
      const result = decodeURIComponent(urlEncodeObject(obj, prefixFormat));
      expect(result).toStrictEqual(expectedResult);
    }
  );
});
