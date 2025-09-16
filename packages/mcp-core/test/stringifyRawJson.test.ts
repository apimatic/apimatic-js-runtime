import test from 'node:test';
import assert from 'node:assert';
import { stringifyRawJson } from '../src/utils.js';

test('stringifyRawJson works like JSON.stringify for normal objects', () => {
  const obj = { a: 1, b: 'x', c: true, d: null };
  const result = stringifyRawJson(obj);
  assert.strictEqual(result, JSON.stringify(obj));
});

test('stringifyRawJson converts bigint to number', () => {
  const obj = { id: 123n, count: BigInt(42) };
  const result = stringifyRawJson(obj);
  assert.strictEqual(result, '{"id":123,"count":42}');
});

test('stringifyRawJson handles arrays with bigint', () => {
  const arr = [1n, 2n, 3n];
  const result = stringifyRawJson(arr);
  assert.strictEqual(result, '[1,2,3]');
});

test('stringifyRawJson handles nested objects with bigint', () => {
  const obj = { nested: { big: 999n } };
  const result = stringifyRawJson(obj);
  assert.strictEqual(result, '{"nested":{"big":999}}');
});

test('stringifyRawJson handles undefined (same as JSON.stringify)', () => {
  const obj = { a: undefined, b: 1 };
  const result = stringifyRawJson(obj);
  assert.strictEqual(result, JSON.stringify(obj)); // {"b":1}
});
