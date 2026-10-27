import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const lock = JSON.parse(await readFile(new URL('dependency-lock.json', root), 'utf8'));
assert(/^[a-f0-9]{40}$/.test(lock.commit), 'Dependency must pin a full Git commit');
assert(
  lock.repository === 'https://github.com/squircle-icons/svelte',
  'Unexpected dependency repository',
);
const actual = createHash('sha256')
  .update(await readFile(new URL(lock.artifact, root)))
  .digest('hex');
assert.equal(actual, lock.sha256, 'Dependency artifact changed without updating provenance');
const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (lock.registry) {
  assert.equal(lock.registry, 'https://registry.npmjs.org', 'Unexpected npm registry');
  assert.equal(
    manifest.dependencies['@squircle-icons/svelte'],
    lock.version,
    'Pin the exact npm release',
  );
  const integrity =
    'sha512-' +
    createHash('sha512')
      .update(await readFile(new URL(lock.artifact, root)))
      .digest('base64');
  assert.equal(integrity, lock.integrity, 'Recorded artifact differs from npm integrity');
} else {
  assert.equal(
    manifest.dependencies['@squircle-icons/svelte'],
    `file:${lock.artifact}`,
    'Dependency does not match its source artifact',
  );
}
const installedManifest = JSON.parse(
  await readFile(
    new URL('../package.json', import.meta.resolve('@squircle-icons/svelte/catalog.json')),
    'utf8',
  ),
);
assert.equal(
  installedManifest.version,
  lock.version,
  'Installed package version differs from provenance',
);
const installed = JSON.parse(
  await readFile(fileURLToPath(import.meta.resolve('@squircle-icons/svelte/catalog.json')), 'utf8'),
);
const expected = JSON.parse(await readFile(new URL('vendor/svelte-catalog.json', root), 'utf8'));
assert.deepEqual(installed, expected, 'Installed dependency differs from the recorded snapshot');
console.log(`Verified svelte commit ${lock.commit} and artifact SHA-256.`);
