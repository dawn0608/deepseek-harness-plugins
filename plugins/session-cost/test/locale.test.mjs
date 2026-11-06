import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8');

/** Return the brace-delimited body that follows one dictionary marker. */
function dictionaryBody(text, marker) {
  const markerAt = text.indexOf(marker);
  if (markerAt < 0) throw new Error(`client.js is missing the ${marker} dictionary marker`);
  const open = text.indexOf('{', markerAt);
  if (open < 0) throw new Error(`client.js has no opening brace after ${marker}`);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = open; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quote !== null) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') {
      const newline = text.indexOf('\n', index + 2);
      index = newline < 0 ? text.length : newline;
      continue;
    }
    if (char === '/' && next === '*') {
      const end = text.indexOf('*/', index + 2);
      if (end < 0) throw new Error(`client.js has an unterminated comment after ${marker}`);
      index = end + 1;
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(open + 1, index);
      if (depth < 0) throw new Error(`client.js has an unbalanced closing brace after ${marker}`);
    }
  }
  throw new Error(`client.js has an unterminated object after ${marker}`);
}

/** Extract the one-level key set from a dictionary body. */
function dictionaryKeys(text, marker) {
  const body = dictionaryBody(text, marker);
  const keys = [...body.matchAll(/^\s*([A-Za-z_$][\w$]*)\s*:/gm)].map(match => match[1]);
  if (keys.length === 0) throw new Error(`client.js has no keys in the ${marker} dictionary`);
  const unique = new Set(keys);
  if (unique.size !== keys.length) throw new Error(`client.js has duplicate keys in the ${marker} dictionary`);
  return unique;
}

test('client zh/en dictionaries expose identical key sets', () => {
  const zh = dictionaryKeys(source, 'zh: {');
  const en = dictionaryKeys(source, 'DICTS.en = {');
  assert.equal(zh.size > 0, true);
  assert.equal(/DICTS\.en\s*=\s*DICTS\.zh/.test(source), false);
  assert.deepEqual([...zh].sort(), [...en].sort());
});

test('dictionary extraction fails loudly when a marker is missing', () => {
  assert.throws(
    () => dictionaryKeys('const DICTS = {};', 'DICTS.en = {'),
    /missing the DICTS\.en = \{ dictionary marker/,
  );
});
