import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function loadClient() {
  const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
  let entry;
  const window = {
    __ModuleLoader__: {
      load(value) {
        entry = value;
      },
    },
  };
  vm.runInNewContext(source, { window, console });
  assert.ok(entry, 'client bundle did not call window.__ModuleLoader__.load');
  return entry;
}

function fakeRequire() {
  return {
    createElement: () => null,
    createPortal: () => null,
  };
}

test('client bundle registers the package name as its loader id', () => {
  const entry = loadClient();
  assert.equal(entry.id, pkg.name);
  assert.equal(typeof entry.factory, 'function');
});

test('client factory exposes apply and the declared services', () => {
  const entry = loadClient();
  const mod = entry.factory(fakeRequire);
  assert.equal(typeof mod.apply, 'function');
  assert.deepEqual([...mod.inject].sort(), ['locale', 'slots']);
});
