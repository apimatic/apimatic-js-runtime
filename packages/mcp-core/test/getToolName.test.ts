import test from 'node:test';
import assert from 'node:assert/strict';
import { getToolName } from '../src/utils.js';

test('getToolName combines endpoint group and name', () => {
  assert.strictEqual(getToolName('group', 'create_order'), 'group-create_order');
});

test('getToolName requires lower case', () => {
  assert.strictEqual(getToolName('group', 'Create_Order'), 'group-create_order');
});

test('getToolName converts non-alphanumerics to underscores', () => {
  assert.strictEqual(getToolName('group', '$abc %123'), 'group-_abc__123');
});

test('getToolName converts camel case to snake case', () => {
  assert.strictEqual(getToolName('group', 'createOrder'), 'group-create_order');
});

test('getToolName converts pascal case to snake case', () => {
  assert.strictEqual(getToolName('group', 'XMLHttpRequest'), 'group-xml_http_request');
});

test('getToolName cuts off long tool names at 64 characters', () => {
  assert.strictEqual(getToolName('group', 'a'.repeat(70)), 'group-' + 'a'.repeat(58));
});

test('getToolName throws on empty strings', () => {
  assert.throws(() => getToolName('group', ''));
  assert.throws(() => getToolName('', 'name'));
  assert.throws(() => getToolName('', ''));
});