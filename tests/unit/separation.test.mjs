import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
const root = new URL('../../', import.meta.url);
async function scan(url) {
  const files = [];
  for (const item of await readdir(url, { withFileTypes: true })) {
    const path = new URL(item.name + (item.isDirectory() ? '/' : ''), url);
    files.push(...(item.isDirectory() ? await scan(path) : [path]));
  }
  return files;
}
it('ships only the public package, without review routes, helpers, tools or artifacts', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  assert.equal(manifest.devDependencies['@squircle-icons/lab-svelte'], undefined);
  assert.equal(manifest.scripts['sync:lab'], undefined);
  for (const path of [
    'src/routes/lab',
    'src/lib/catalog.ts',
    'src/lib/components/StaticIconPreview.svelte',
    'src/lib/components/MorphIcon.svelte',
    'src/lib/visible-bounds.ts',
    'tools/sync-lab.mjs',
    'lab-dependency-lock.json',
    'vendor/lab-svelte-catalog.json',
  ])
    await assert.rejects(access(new URL(path, root)));
  for (const file of [
    ...(await scan(new URL('src/', root))),
    ...(await scan(new URL('tools/', root))),
  ])
    assert.doesNotMatch(
      await readFile(file, 'utf8'),
      /@squircle-icons\/lab-svelte|labCatalog|\/lab(?:[\/'"]|$)/,
    );
  const lock = JSON.parse(await readFile(new URL('dependency-lock.json', root), 'utf8'));
  assert.deepEqual(
    (await readdir(new URL('vendor/', root))).filter((file) => file.endsWith('.tgz')),
    [lock.artifact.split('/').at(-1)],
  );
});
