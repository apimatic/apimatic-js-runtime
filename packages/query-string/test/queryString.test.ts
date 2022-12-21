import { FileWrapper, isFileWrapper } from '@apimatic';
import fs from 'fs';
import path from 'path';
import {
  urlEncodeObject,
  ArrayPrefixFunction,
  indexedPrefix,
  tabPrefix,
  unindexedPrefix,
  plainPrefix,
  pipePrefix,
  commaPrefix,
  filterFileWrapperFromKeyValuePairs,
  FormKeyValuePairList,
  formDataEncodeObject,
} from '../../src/http/queryString';

const dependent1 = {
  name: 'rehan',
  field: 'front-end',
};
Object.setPrototypeOf(dependent1, { lastName: 'adnan' });

const dependent2 = {
  name: 'Gill',
  field: 'back-end',
};

const employee = {
  age: 15,
  dependents: [dependent1, dependent2],
  dependentIDs: [1, 2, 3],
};

describe('test query encoding', () => {
  test.each([
    [
      'test simple array indexed prefix format',
      { params: ['name', 'field', 'address', 'designation'] },
      indexedPrefix,
      `params[0]=name&params[1]=field&params[2]=address&params[3]=designation`,
    ],
    [
      'test simple object indexed prefix format',
      employee,
      indexedPrefix,
      `age=15&dependents[0][name]=rehan&dependents[0][field]=front-end&dependents[1][name]=Gill&dependents[1][field]=back-end&dependentIDs[0]=1&dependentIDs[1]=2&dependentIDs[2]=3`,
    ],
    [
      'test complex indexed prefix format',
      {
        complexType: {
          key1: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
          key2: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
        },
      },
      indexedPrefix,
      `complexType[key1][numberListType][0]=555&complexType[key1][numberListType][1]=666&complexType[key1][numberListType][2]=777&complexType[key1][numberMapType][num1]=1&complexType[key1][numberMapType][num3]=2&complexType[key1][numberMapType][num2]=3&complexType[key1][innerComplexType][stringType]=MyString1&complexType[key1][innerComplexType][booleanType]=true&complexType[key1][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexType][dateType]=1994-02-13&complexType[key1][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexType][longType]=500000000&complexType[key1][innerComplexType][precisionType]=5.43&complexType[key1][innerComplexType][objectType][long2]=1000000000&complexType[key1][innerComplexType][objectType][long1]=500000000&complexType[key1][innerComplexType][stringListType][0]=Item1&complexType[key1][innerComplexType][stringListType][1]=Item2&complexType[key1][innerComplexListType][0][stringType]=MyString1&complexType[key1][innerComplexListType][0][booleanType]=true&complexType[key1][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][0][dateType]=1994-02-13&complexType[key1][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexListType][0][longType]=500000000&complexType[key1][innerComplexListType][0][precisionType]=5.43&complexType[key1][innerComplexListType][0][objectType][long2]=1000000000&complexType[key1][innerComplexListType][0][objectType][long1]=500000000&complexType[key1][innerComplexListType][0][stringListType][0]=Item1&complexType[key1][innerComplexListType][0][stringListType][1]=Item2&complexType[key1][innerComplexListType][1][stringType]=MyString2&complexType[key1][innerComplexListType][1][booleanType]=false&complexType[key1][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][1][dateType]=1994-02-12&complexType[key1][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key1][innerComplexListType][1][longType]=1000000000&complexType[key1][innerComplexListType][1][precisionType]=5.43&complexType[key1][innerComplexListType][1][objectType][bool1]=true&complexType[key1][innerComplexListType][1][objectType][bool2]=false&complexType[key1][innerComplexListType][1][stringListType][0]=Item1&complexType[key1][innerComplexListType][1][stringListType][1]=Item2&complexType[key2][numberListType][0]=555&complexType[key2][numberListType][1]=666&complexType[key2][numberListType][2]=777&complexType[key2][numberMapType][num1]=1&complexType[key2][numberMapType][num3]=2&complexType[key2][numberMapType][num2]=3&complexType[key2][innerComplexType][stringType]=MyString1&complexType[key2][innerComplexType][booleanType]=true&complexType[key2][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexType][dateType]=1994-02-13&complexType[key2][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexType][longType]=500000000&complexType[key2][innerComplexType][precisionType]=5.43&complexType[key2][innerComplexType][objectType][long2]=1000000000&complexType[key2][innerComplexType][objectType][long1]=500000000&complexType[key2][innerComplexType][stringListType][0]=Item1&complexType[key2][innerComplexType][stringListType][1]=Item2&complexType[key2][innerComplexListType][0][stringType]=MyString1&complexType[key2][innerComplexListType][0][booleanType]=true&complexType[key2][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][0][dateType]=1994-02-13&complexType[key2][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexListType][0][longType]=500000000&complexType[key2][innerComplexListType][0][precisionType]=5.43&complexType[key2][innerComplexListType][0][objectType][long2]=1000000000&complexType[key2][innerComplexListType][0][objectType][long1]=500000000&complexType[key2][innerComplexListType][0][stringListType][0]=Item1&complexType[key2][innerComplexListType][0][stringListType][1]=Item2&complexType[key2][innerComplexListType][1][stringType]=MyString2&complexType[key2][innerComplexListType][1][booleanType]=false&complexType[key2][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][1][dateType]=1994-02-12&complexType[key2][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key2][innerComplexListType][1][longType]=1000000000&complexType[key2][innerComplexListType][1][precisionType]=5.43&complexType[key2][innerComplexListType][1][objectType][bool1]=true&complexType[key2][innerComplexListType][1][objectType][bool2]=false&complexType[key2][innerComplexListType][1][stringListType][0]=Item1&complexType[key2][innerComplexListType][1][stringListType][1]=Item2`,
    ],
    [
      'test simple array unindexed prefix format',
      { params: ['name', 'field', 'address', 'designation'] },
      unindexedPrefix,
      `params[]=name&params[]=field&params[]=address&params[]=designation`,
    ],
    [
      'test unindexed prefix format',
      {
        age: 15,
        dependents: [
          { name: 'rehan', field: 'front-end' },
          { name: 'Gill', field: 'back-end' },
          [1, 2, 3],
        ],
      },
      unindexedPrefix,
      `age=15&dependents[0][name]=rehan&dependents[0][field]=front-end&dependents[1][name]=Gill&dependents[1][field]=back-end&dependents[2][]=1&dependents[2][]=2&dependents[2][]=3`,
    ],
    [
      'test complex unindexed prefix format',
      {
        complexType: {
          key1: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
          key2: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
        },
      },
      unindexedPrefix,
      `complexType[key1][numberListType][]=555&complexType[key1][numberListType][]=666&complexType[key1][numberListType][]=777&complexType[key1][numberMapType][num1]=1&complexType[key1][numberMapType][num3]=2&complexType[key1][numberMapType][num2]=3&complexType[key1][innerComplexType][stringType]=MyString1&complexType[key1][innerComplexType][booleanType]=true&complexType[key1][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexType][dateType]=1994-02-13&complexType[key1][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexType][longType]=500000000&complexType[key1][innerComplexType][precisionType]=5.43&complexType[key1][innerComplexType][objectType][long2]=1000000000&complexType[key1][innerComplexType][objectType][long1]=500000000&complexType[key1][innerComplexType][stringListType][]=Item1&complexType[key1][innerComplexType][stringListType][]=Item2&complexType[key1][innerComplexListType][0][stringType]=MyString1&complexType[key1][innerComplexListType][0][booleanType]=true&complexType[key1][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][0][dateType]=1994-02-13&complexType[key1][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexListType][0][longType]=500000000&complexType[key1][innerComplexListType][0][precisionType]=5.43&complexType[key1][innerComplexListType][0][objectType][long2]=1000000000&complexType[key1][innerComplexListType][0][objectType][long1]=500000000&complexType[key1][innerComplexListType][0][stringListType][]=Item1&complexType[key1][innerComplexListType][0][stringListType][]=Item2&complexType[key1][innerComplexListType][1][stringType]=MyString2&complexType[key1][innerComplexListType][1][booleanType]=false&complexType[key1][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][1][dateType]=1994-02-12&complexType[key1][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key1][innerComplexListType][1][longType]=1000000000&complexType[key1][innerComplexListType][1][precisionType]=5.43&complexType[key1][innerComplexListType][1][objectType][bool1]=true&complexType[key1][innerComplexListType][1][objectType][bool2]=false&complexType[key1][innerComplexListType][1][stringListType][]=Item1&complexType[key1][innerComplexListType][1][stringListType][]=Item2&complexType[key2][numberListType][]=555&complexType[key2][numberListType][]=666&complexType[key2][numberListType][]=777&complexType[key2][numberMapType][num1]=1&complexType[key2][numberMapType][num3]=2&complexType[key2][numberMapType][num2]=3&complexType[key2][innerComplexType][stringType]=MyString1&complexType[key2][innerComplexType][booleanType]=true&complexType[key2][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexType][dateType]=1994-02-13&complexType[key2][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexType][longType]=500000000&complexType[key2][innerComplexType][precisionType]=5.43&complexType[key2][innerComplexType][objectType][long2]=1000000000&complexType[key2][innerComplexType][objectType][long1]=500000000&complexType[key2][innerComplexType][stringListType][]=Item1&complexType[key2][innerComplexType][stringListType][]=Item2&complexType[key2][innerComplexListType][0][stringType]=MyString1&complexType[key2][innerComplexListType][0][booleanType]=true&complexType[key2][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][0][dateType]=1994-02-13&complexType[key2][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexListType][0][longType]=500000000&complexType[key2][innerComplexListType][0][precisionType]=5.43&complexType[key2][innerComplexListType][0][objectType][long2]=1000000000&complexType[key2][innerComplexListType][0][objectType][long1]=500000000&complexType[key2][innerComplexListType][0][stringListType][]=Item1&complexType[key2][innerComplexListType][0][stringListType][]=Item2&complexType[key2][innerComplexListType][1][stringType]=MyString2&complexType[key2][innerComplexListType][1][booleanType]=false&complexType[key2][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][1][dateType]=1994-02-12&complexType[key2][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key2][innerComplexListType][1][longType]=1000000000&complexType[key2][innerComplexListType][1][precisionType]=5.43&complexType[key2][innerComplexListType][1][objectType][bool1]=true&complexType[key2][innerComplexListType][1][objectType][bool2]=false&complexType[key2][innerComplexListType][1][stringListType][]=Item1&complexType[key2][innerComplexListType][1][stringListType][]=Item2`,
    ],
    [
      'test simple array plane prefix format',
      { params: ['name', 'field', 'address', 'designation'] },
      plainPrefix,
      `params=name&params=field&params=address&params=designation`,
    ],
    [
      'test plane prefix format',
      {
        age: 15,
        dependents: [
          { name: 'rehan', field: 'front-end' },
          { name: 'Gill', field: 'back-end' },
          [1, 2, 3],
        ],
      },
      plainPrefix,
      `age=15&dependents[0][name]=rehan&dependents[0][field]=front-end&dependents[1][name]=Gill&dependents[1][field]=back-end&dependents[2]=1&dependents[2]=2&dependents[2]=3`,
    ],
    [
      'test complex plane prefix format',
      {
        complexType: {
          key1: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
          key2: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
        },
      },
      plainPrefix,
      `complexType[key1][numberListType]=555&complexType[key1][numberListType]=666&complexType[key1][numberListType]=777&complexType[key1][numberMapType][num1]=1&complexType[key1][numberMapType][num3]=2&complexType[key1][numberMapType][num2]=3&complexType[key1][innerComplexType][stringType]=MyString1&complexType[key1][innerComplexType][booleanType]=true&complexType[key1][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexType][dateType]=1994-02-13&complexType[key1][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexType][longType]=500000000&complexType[key1][innerComplexType][precisionType]=5.43&complexType[key1][innerComplexType][objectType][long2]=1000000000&complexType[key1][innerComplexType][objectType][long1]=500000000&complexType[key1][innerComplexType][stringListType]=Item1&complexType[key1][innerComplexType][stringListType]=Item2&complexType[key1][innerComplexListType][0][stringType]=MyString1&complexType[key1][innerComplexListType][0][booleanType]=true&complexType[key1][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][0][dateType]=1994-02-13&complexType[key1][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexListType][0][longType]=500000000&complexType[key1][innerComplexListType][0][precisionType]=5.43&complexType[key1][innerComplexListType][0][objectType][long2]=1000000000&complexType[key1][innerComplexListType][0][objectType][long1]=500000000&complexType[key1][innerComplexListType][0][stringListType]=Item1&complexType[key1][innerComplexListType][0][stringListType]=Item2&complexType[key1][innerComplexListType][1][stringType]=MyString2&complexType[key1][innerComplexListType][1][booleanType]=false&complexType[key1][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][1][dateType]=1994-02-12&complexType[key1][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key1][innerComplexListType][1][longType]=1000000000&complexType[key1][innerComplexListType][1][precisionType]=5.43&complexType[key1][innerComplexListType][1][objectType][bool1]=true&complexType[key1][innerComplexListType][1][objectType][bool2]=false&complexType[key1][innerComplexListType][1][stringListType]=Item1&complexType[key1][innerComplexListType][1][stringListType]=Item2&complexType[key2][numberListType]=555&complexType[key2][numberListType]=666&complexType[key2][numberListType]=777&complexType[key2][numberMapType][num1]=1&complexType[key2][numberMapType][num3]=2&complexType[key2][numberMapType][num2]=3&complexType[key2][innerComplexType][stringType]=MyString1&complexType[key2][innerComplexType][booleanType]=true&complexType[key2][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexType][dateType]=1994-02-13&complexType[key2][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexType][longType]=500000000&complexType[key2][innerComplexType][precisionType]=5.43&complexType[key2][innerComplexType][objectType][long2]=1000000000&complexType[key2][innerComplexType][objectType][long1]=500000000&complexType[key2][innerComplexType][stringListType]=Item1&complexType[key2][innerComplexType][stringListType]=Item2&complexType[key2][innerComplexListType][0][stringType]=MyString1&complexType[key2][innerComplexListType][0][booleanType]=true&complexType[key2][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][0][dateType]=1994-02-13&complexType[key2][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexListType][0][longType]=500000000&complexType[key2][innerComplexListType][0][precisionType]=5.43&complexType[key2][innerComplexListType][0][objectType][long2]=1000000000&complexType[key2][innerComplexListType][0][objectType][long1]=500000000&complexType[key2][innerComplexListType][0][stringListType]=Item1&complexType[key2][innerComplexListType][0][stringListType]=Item2&complexType[key2][innerComplexListType][1][stringType]=MyString2&complexType[key2][innerComplexListType][1][booleanType]=false&complexType[key2][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][1][dateType]=1994-02-12&complexType[key2][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key2][innerComplexListType][1][longType]=1000000000&complexType[key2][innerComplexListType][1][precisionType]=5.43&complexType[key2][innerComplexListType][1][objectType][bool1]=true&complexType[key2][innerComplexListType][1][objectType][bool2]=false&complexType[key2][innerComplexListType][1][stringListType]=Item1&complexType[key2][innerComplexListType][1][stringListType]=Item2`,
    ],
    [
      'test simple array comma prefix format',
      { params: ['name', 'field', 'address', 'designation'] },
      commaPrefix,
      `params=name,field,address,designation`,
    ],
    [
      'test comma prefix format',
      {
        age: 15,
        dependents: [
          { name: 'rehan', field: 'front-end' },
          { name: 'Gill', field: 'back-end' },
          [1, 2, 3],
        ],
      },
      commaPrefix,
      `age=15&dependents[0][name]=rehan&dependents[0][field]=front-end&dependents[1][name]=Gill&dependents[1][field]=back-end&dependents[2]=1,2,3`,
    ],
    [
      'test complex comma prefix format',
      {
        complexType: {
          key1: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
          key2: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
        },
      },
      commaPrefix,
      `complexType[key1][numberListType]=555,666,777&complexType[key1][numberMapType][num1]=1&complexType[key1][numberMapType][num3]=2&complexType[key1][numberMapType][num2]=3&complexType[key1][innerComplexType][stringType]=MyString1&complexType[key1][innerComplexType][booleanType]=true&complexType[key1][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexType][dateType]=1994-02-13&complexType[key1][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexType][longType]=500000000&complexType[key1][innerComplexType][precisionType]=5.43&complexType[key1][innerComplexType][objectType][long2]=1000000000&complexType[key1][innerComplexType][objectType][long1]=500000000&complexType[key1][innerComplexType][stringListType]=Item1,Item2&complexType[key1][innerComplexListType][0][stringType]=MyString1&complexType[key1][innerComplexListType][0][booleanType]=true&complexType[key1][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][0][dateType]=1994-02-13&complexType[key1][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexListType][0][longType]=500000000&complexType[key1][innerComplexListType][0][precisionType]=5.43&complexType[key1][innerComplexListType][0][objectType][long2]=1000000000&complexType[key1][innerComplexListType][0][objectType][long1]=500000000&complexType[key1][innerComplexListType][0][stringListType]=Item1,Item2&complexType[key1][innerComplexListType][1][stringType]=MyString2&complexType[key1][innerComplexListType][1][booleanType]=false&complexType[key1][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][1][dateType]=1994-02-12&complexType[key1][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key1][innerComplexListType][1][longType]=1000000000&complexType[key1][innerComplexListType][1][precisionType]=5.43&complexType[key1][innerComplexListType][1][objectType][bool1]=true&complexType[key1][innerComplexListType][1][objectType][bool2]=false&complexType[key1][innerComplexListType][1][stringListType]=Item1,Item2&complexType[key2][numberListType]=555,666,777&complexType[key2][numberMapType][num1]=1&complexType[key2][numberMapType][num3]=2&complexType[key2][numberMapType][num2]=3&complexType[key2][innerComplexType][stringType]=MyString1&complexType[key2][innerComplexType][booleanType]=true&complexType[key2][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexType][dateType]=1994-02-13&complexType[key2][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexType][longType]=500000000&complexType[key2][innerComplexType][precisionType]=5.43&complexType[key2][innerComplexType][objectType][long2]=1000000000&complexType[key2][innerComplexType][objectType][long1]=500000000&complexType[key2][innerComplexType][stringListType]=Item1,Item2&complexType[key2][innerComplexListType][0][stringType]=MyString1&complexType[key2][innerComplexListType][0][booleanType]=true&complexType[key2][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][0][dateType]=1994-02-13&complexType[key2][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexListType][0][longType]=500000000&complexType[key2][innerComplexListType][0][precisionType]=5.43&complexType[key2][innerComplexListType][0][objectType][long2]=1000000000&complexType[key2][innerComplexListType][0][objectType][long1]=500000000&complexType[key2][innerComplexListType][0][stringListType]=Item1,Item2&complexType[key2][innerComplexListType][1][stringType]=MyString2&complexType[key2][innerComplexListType][1][booleanType]=false&complexType[key2][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][1][dateType]=1994-02-12&complexType[key2][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key2][innerComplexListType][1][longType]=1000000000&complexType[key2][innerComplexListType][1][precisionType]=5.43&complexType[key2][innerComplexListType][1][objectType][bool1]=true&complexType[key2][innerComplexListType][1][objectType][bool2]=false&complexType[key2][innerComplexListType][1][stringListType]=Item1,Item2`,
    ],
    [
      'test simple array comma prefix format',
      { params: ['name', 'field', 'address', 'designation'] },
      tabPrefix,
      `params=name\tfield\taddress\tdesignation`,
    ],
    [
      'test tab prefix format',
      {
        age: 15,
        dependents: [
          { name: 'rehan', field: 'front-end' },
          { name: 'Gill', field: 'back-end' },
          [1, 2, 3],
        ],
      },
      tabPrefix,
      `age=15&dependents[0][name]=rehan&dependents[0][field]=front-end&dependents[1][name]=Gill&dependents[1][field]=back-end&dependents[2]=1\t2\t3`,
    ],
    [
      'test complex tab prefix format',
      {
        complexType: {
          key1: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
          key2: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
        },
      },
      tabPrefix,
      `complexType[key1][numberListType]=555\t666\t777&complexType[key1][numberMapType][num1]=1&complexType[key1][numberMapType][num3]=2&complexType[key1][numberMapType][num2]=3&complexType[key1][innerComplexType][stringType]=MyString1&complexType[key1][innerComplexType][booleanType]=true&complexType[key1][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexType][dateType]=1994-02-13&complexType[key1][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexType][longType]=500000000&complexType[key1][innerComplexType][precisionType]=5.43&complexType[key1][innerComplexType][objectType][long2]=1000000000&complexType[key1][innerComplexType][objectType][long1]=500000000&complexType[key1][innerComplexType][stringListType]=Item1\tItem2&complexType[key1][innerComplexListType][0][stringType]=MyString1&complexType[key1][innerComplexListType][0][booleanType]=true&complexType[key1][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][0][dateType]=1994-02-13&complexType[key1][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexListType][0][longType]=500000000&complexType[key1][innerComplexListType][0][precisionType]=5.43&complexType[key1][innerComplexListType][0][objectType][long2]=1000000000&complexType[key1][innerComplexListType][0][objectType][long1]=500000000&complexType[key1][innerComplexListType][0][stringListType]=Item1\tItem2&complexType[key1][innerComplexListType][1][stringType]=MyString2&complexType[key1][innerComplexListType][1][booleanType]=false&complexType[key1][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][1][dateType]=1994-02-12&complexType[key1][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key1][innerComplexListType][1][longType]=1000000000&complexType[key1][innerComplexListType][1][precisionType]=5.43&complexType[key1][innerComplexListType][1][objectType][bool1]=true&complexType[key1][innerComplexListType][1][objectType][bool2]=false&complexType[key1][innerComplexListType][1][stringListType]=Item1\tItem2&complexType[key2][numberListType]=555\t666\t777&complexType[key2][numberMapType][num1]=1&complexType[key2][numberMapType][num3]=2&complexType[key2][numberMapType][num2]=3&complexType[key2][innerComplexType][stringType]=MyString1&complexType[key2][innerComplexType][booleanType]=true&complexType[key2][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexType][dateType]=1994-02-13&complexType[key2][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexType][longType]=500000000&complexType[key2][innerComplexType][precisionType]=5.43&complexType[key2][innerComplexType][objectType][long2]=1000000000&complexType[key2][innerComplexType][objectType][long1]=500000000&complexType[key2][innerComplexType][stringListType]=Item1\tItem2&complexType[key2][innerComplexListType][0][stringType]=MyString1&complexType[key2][innerComplexListType][0][booleanType]=true&complexType[key2][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][0][dateType]=1994-02-13&complexType[key2][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexListType][0][longType]=500000000&complexType[key2][innerComplexListType][0][precisionType]=5.43&complexType[key2][innerComplexListType][0][objectType][long2]=1000000000&complexType[key2][innerComplexListType][0][objectType][long1]=500000000&complexType[key2][innerComplexListType][0][stringListType]=Item1\tItem2&complexType[key2][innerComplexListType][1][stringType]=MyString2&complexType[key2][innerComplexListType][1][booleanType]=false&complexType[key2][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][1][dateType]=1994-02-12&complexType[key2][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key2][innerComplexListType][1][longType]=1000000000&complexType[key2][innerComplexListType][1][precisionType]=5.43&complexType[key2][innerComplexListType][1][objectType][bool1]=true&complexType[key2][innerComplexListType][1][objectType][bool2]=false&complexType[key2][innerComplexListType][1][stringListType]=Item1\tItem2`,
    ],
    [
      'test simple array comma prefix format',
      { params: ['name', 'field', 'address', 'designation'] },
      pipePrefix,
      `params=name|field|address|designation`,
    ],
    [
      'test pipe prefix format',
      {
        age: 15,
        dependents: [
          { name: 'rehan', field: 'front-end' },
          { name: 'Gill', field: 'back-end' },
          [1, 2, 3],
        ],
      },
      pipePrefix,
      `age=15&dependents[0][name]=rehan&dependents[0][field]=front-end&dependents[1][name]=Gill&dependents[1][field]=back-end&dependents[2]=1|2|3`,
    ],
    [
      'test complex pipe prefix format',
      {
        complexType: {
          key1: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
          key2: {
            numberListType: [555, 666, 777],
            numberMapType: { num1: 1, num3: 2, num2: 3 },
            innerComplexType: {
              stringType: 'MyString1',
              booleanType: true,
              dateTimeType: '1994-11-06T08:49:37Z',
              dateType: '1994-02-13',
              uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
              longType: 500000000,
              precisionType: 5.43,
              objectType: { long2: 1000000000, long1: 500000000 },
              stringListType: ['Item1', 'Item2'],
            },
            innerComplexListType: [
              {
                stringType: 'MyString1',
                booleanType: true,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-13',
                uuidType: 'a5e48529-745b-4dfb-aac0-a7d844debd8b',
                longType: 500000000,
                precisionType: 5.43,
                objectType: { long2: 1000000000, long1: 500000000 },
                stringListType: ['Item1', 'Item2'],
              },
              {
                stringType: 'MyString2',
                booleanType: false,
                dateTimeType: '1994-11-06T08:49:37Z',
                dateType: '1994-02-12',
                uuidType: 'b46ba2d3-b4ac-4b40-ae62-6326e88c89a6',
                longType: 1000000000,
                precisionType: 5.43,
                objectType: { bool1: true, bool2: false },
                stringListType: ['Item1', 'Item2'],
              },
            ],
          },
        },
      },
      pipePrefix,
      `complexType[key1][numberListType]=555|666|777&complexType[key1][numberMapType][num1]=1&complexType[key1][numberMapType][num3]=2&complexType[key1][numberMapType][num2]=3&complexType[key1][innerComplexType][stringType]=MyString1&complexType[key1][innerComplexType][booleanType]=true&complexType[key1][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexType][dateType]=1994-02-13&complexType[key1][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexType][longType]=500000000&complexType[key1][innerComplexType][precisionType]=5.43&complexType[key1][innerComplexType][objectType][long2]=1000000000&complexType[key1][innerComplexType][objectType][long1]=500000000&complexType[key1][innerComplexType][stringListType]=Item1|Item2&complexType[key1][innerComplexListType][0][stringType]=MyString1&complexType[key1][innerComplexListType][0][booleanType]=true&complexType[key1][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][0][dateType]=1994-02-13&complexType[key1][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key1][innerComplexListType][0][longType]=500000000&complexType[key1][innerComplexListType][0][precisionType]=5.43&complexType[key1][innerComplexListType][0][objectType][long2]=1000000000&complexType[key1][innerComplexListType][0][objectType][long1]=500000000&complexType[key1][innerComplexListType][0][stringListType]=Item1|Item2&complexType[key1][innerComplexListType][1][stringType]=MyString2&complexType[key1][innerComplexListType][1][booleanType]=false&complexType[key1][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key1][innerComplexListType][1][dateType]=1994-02-12&complexType[key1][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key1][innerComplexListType][1][longType]=1000000000&complexType[key1][innerComplexListType][1][precisionType]=5.43&complexType[key1][innerComplexListType][1][objectType][bool1]=true&complexType[key1][innerComplexListType][1][objectType][bool2]=false&complexType[key1][innerComplexListType][1][stringListType]=Item1|Item2&complexType[key2][numberListType]=555|666|777&complexType[key2][numberMapType][num1]=1&complexType[key2][numberMapType][num3]=2&complexType[key2][numberMapType][num2]=3&complexType[key2][innerComplexType][stringType]=MyString1&complexType[key2][innerComplexType][booleanType]=true&complexType[key2][innerComplexType][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexType][dateType]=1994-02-13&complexType[key2][innerComplexType][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexType][longType]=500000000&complexType[key2][innerComplexType][precisionType]=5.43&complexType[key2][innerComplexType][objectType][long2]=1000000000&complexType[key2][innerComplexType][objectType][long1]=500000000&complexType[key2][innerComplexType][stringListType]=Item1|Item2&complexType[key2][innerComplexListType][0][stringType]=MyString1&complexType[key2][innerComplexListType][0][booleanType]=true&complexType[key2][innerComplexListType][0][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][0][dateType]=1994-02-13&complexType[key2][innerComplexListType][0][uuidType]=a5e48529-745b-4dfb-aac0-a7d844debd8b&complexType[key2][innerComplexListType][0][longType]=500000000&complexType[key2][innerComplexListType][0][precisionType]=5.43&complexType[key2][innerComplexListType][0][objectType][long2]=1000000000&complexType[key2][innerComplexListType][0][objectType][long1]=500000000&complexType[key2][innerComplexListType][0][stringListType]=Item1|Item2&complexType[key2][innerComplexListType][1][stringType]=MyString2&complexType[key2][innerComplexListType][1][booleanType]=false&complexType[key2][innerComplexListType][1][dateTimeType]=1994-11-06T08:49:37Z&complexType[key2][innerComplexListType][1][dateType]=1994-02-12&complexType[key2][innerComplexListType][1][uuidType]=b46ba2d3-b4ac-4b40-ae62-6326e88c89a6&complexType[key2][innerComplexListType][1][longType]=1000000000&complexType[key2][innerComplexListType][1][precisionType]=5.43&complexType[key2][innerComplexListType][1][objectType][bool1]=true&complexType[key2][innerComplexListType][1][objectType][bool2]=false&complexType[key2][innerComplexListType][1][stringListType]=Item1|Item2`,
    ],
    [
      'test object of null parameters with default array prefix',
      { param1: null, param2: undefined },
      indexedPrefix,
      '',
    ],
    [
      'test object of empty parameters with default array prefix',
      { params: {} },
      indexedPrefix,
      '',
    ],
    [
      'test object of symbol type parameters with default array prefix',
      { params: Symbol('test-value') },
      indexedPrefix,
      '',
    ],
    ['test empty object with default array prefix', {}, indexedPrefix, ''],
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

describe('test file wrapper filter', () => {
  test.each([
    [
      'test simple array indexed prefix format',
      [
        {
          key: 'file-param',
          value: new FileWrapper(
            fs.createReadStream(path.join(__dirname, '../dummy_file.txt'))
          ),
        },
        { key: 'string-param', value: 'string' },
      ],
      [{ key: 'string-param', value: 'string' }],
    ],
  ])(
    '%s',
    (
      _: string,
      params: FormKeyValuePairList,
      expectedResult: Array<{ key: string; value: string }>
    ) => {
      const result = filterFileWrapperFromKeyValuePairs(params);
      expect(result).toStrictEqual(expectedResult);
    }
  );
});

describe('test file wrapper form encoding', () => {
  test.each([
    [
      'test file wrapper indexed prefix format',
      {
        param: new FileWrapper(
          fs.createReadStream(path.join(__dirname, '..//dummy_file.txt'))
        ),
      },
    ],
  ])('%s', (_: string, params: Record<string, unknown>) => {
    const result = formDataEncodeObject(params);
    isFileWrapper(result);
  });
});
