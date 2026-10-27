import { it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  readdir,
  rm,
  writeFile,
  chmod,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const project = fileURLToPath(new URL('../../', import.meta.url));
for (const script of ['sync-svelte.mjs'])
  for (const failure of [
    'install',
    'generate',
    'dependency:check',
    'recovery',
    'source-changed',
    'none',
  ])
    it(`${script} ${failure === 'none' ? 'uses a verified artifact' : `restores the checkout after ${failure} fails`}`, async () => {
      const lockName = 'dependency-lock.json';
      const catalogName = 'svelte-catalog.json';
      const directory = await mkdtemp(resolve(tmpdir(), 'squircle-homepage-sync-test-'));
      try {
        const consumer = resolve(directory, 'consumer');
        const source = resolve(directory, 'svelte');
        const bin = resolve(directory, 'bin');
        for (const path of ['tools', 'vendor', 'src/lib', 'node_modules'])
          await mkdir(resolve(consumer, path), { recursive: true });
        await mkdir(resolve(source, 'dist'), { recursive: true });
        await mkdir(bin);
        for (const file of [script, 'sync-rollback.mjs'])
          await cp(resolve(project, 'tools', file), resolve(consumer, 'tools', file));
        await writeFile(
          resolve(source, 'package.json'),
          JSON.stringify({ name: '@squircle-icons/svelte', version: '0.1.0-alpha.0' }),
        );
        await writeFile(resolve(source, 'dist/catalog.json'), '["new"]\n');
        const originalPackage = JSON.stringify({
          dependencies: { '@squircle-icons/svelte': 'file:vendor/old.tgz' },
        });
        const originalLock = JSON.stringify({ artifact: 'vendor/old.tgz', commit: 'old' });
        await writeFile(resolve(consumer, 'package.json'), originalPackage);
        await writeFile(resolve(consumer, 'pnpm-lock.yaml'), 'old-lock');
        await writeFile(resolve(consumer, lockName), originalLock);
        await writeFile(resolve(consumer, 'vendor/old.tgz'), 'old-artifact');
        await writeFile(resolve(consumer, 'vendor', catalogName), '["old"]\n');
        await writeFile(resolve(consumer, 'src/lib/Old.ts'), 'old-source');
        await writeFile(resolve(consumer, 'node_modules/installed.txt'), 'file:vendor/old.tgz');
        await writeFile(
          resolve(bin, 'git'),
          `#!/usr/bin/env node\nconst fs=require('node:fs'),path=require('node:path');\nconsole.log(process.argv[2] === 'rev-parse' ? '${'a'.repeat(40)}' : fs.existsSync(path.join(process.cwd(),'dirty.flag')) ? '?? dirty.flag' : '');\n`,
        );
        await writeFile(
          resolve(bin, 'pnpm'),
          `#!/usr/bin/env node
const fs = require('node:fs'), path = require('node:path');
const args = process.argv.slice(2), root = process.cwd(), command = args[0];
if (args.includes('--force')) throw Error('Destructive reinstall');
if (command === 'pack') {
  fs.writeFileSync(path.join(args[args.indexOf('--pack-destination') + 1], 'squircle-icons-svelte-0.1.0-alpha.0.tgz'), 'new-artifact');
  if (process.env.SYNC_TEST_FAILURE === 'source-changed') fs.writeFileSync(path.join(root,'dirty.flag'),'changed');
}
if (root === process.env.SYNC_TEST_CONSUMER) {
  fs.appendFileSync(process.env.SYNC_TEST_COMMANDS, JSON.stringify(args)+'\\n');
  if (command === 'install') {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    fs.writeFileSync(path.join(root, 'node_modules/installed.txt'), manifest.dependencies['@squircle-icons/svelte']);
    fs.writeFileSync(path.join(root, 'pnpm-lock.yaml'), args.includes('--offline') ? 'old-lock' : 'new-lock');
  }
  if (command === 'generate') {
    fs.writeFileSync(path.join(root, 'src/lib/Old.ts'), 'new-source');
    fs.writeFileSync(path.join(root, 'src/lib/New.ts'), 'new-source');
  }
  if (command === process.env.SYNC_TEST_FAILURE && !args.includes('--offline')) process.exit(42);
if (process.env.SYNC_TEST_FAILURE === 'recovery' && (command === 'generate' || args.includes('--offline'))) process.exit(42);
}
`,
        );
        for (const file of ['git', 'pnpm']) await chmod(resolve(bin, file), 0o755);
        const commands = resolve(directory, 'commands.log');
        const result = spawnSync(process.execPath, [resolve(consumer, 'tools', script), source], {
          cwd: consumer,
          encoding: 'utf8',
          env: {
            ...process.env,
            PATH: bin + ':' + process.env.PATH,
            SYNC_TEST_FAILURE: failure,
            SYNC_TEST_CONSUMER: await realpath(consumer),
            SYNC_TEST_COMMANDS: commands,
          },
        });
        if (failure !== 'none') {
          assert.notEqual(result.status, 0, result.stderr);
          if (failure === 'source-changed') {
            assert.match(result.stderr, /Source files changed during packing/);
            await assert.rejects(readFile(commands), { code: 'ENOENT' });
          }
          if (failure === 'recovery') {
            const backup = result.stderr.match(/backup preserved at ([^\n]+)/)?.[1];
            assert(backup, result.stderr);
            assert.equal(await readFile(resolve(backup, 'src/lib/Old.ts'), 'utf8'), 'old-source');
            assert.equal(await readFile(resolve(backup, 'vendor/old.tgz'), 'utf8'), 'old-artifact');
            await rm(backup, { recursive: true, force: true });
          }
          assert.equal(await readFile(resolve(consumer, 'package.json'), 'utf8'), originalPackage);
          assert.equal(await readFile(resolve(consumer, lockName), 'utf8'), originalLock);
          assert.equal(await readFile(resolve(consumer, 'pnpm-lock.yaml'), 'utf8'), 'old-lock');
          assert.equal(await readFile(resolve(consumer, 'src/lib/Old.ts'), 'utf8'), 'old-source');
          assert.deepEqual(await readdir(resolve(consumer, 'src/lib')), ['Old.ts']);
          assert.deepEqual(
            (await readdir(resolve(consumer, 'vendor'))).sort(),
            ['old.tgz', catalogName].sort(),
          );
          assert.equal(
            await readFile(resolve(consumer, 'node_modules/installed.txt'), 'utf8'),
            'file:vendor/old.tgz',
          );
          const calls =
            failure === 'source-changed'
              ? []
              : (await readFile(commands, 'utf8')).trim().split('\n').map(JSON.parse);
          if (!['source-changed', 'recovery'].includes(failure)) {
            assert(
              calls.some((args) => args[0] === failure),
              'Failure must occur in the consumer, after mutation',
            );
            assert(
              calls.some((args) => args.includes('--offline')),
              'Old installation must be restored',
            );
          }
        } else {
          assert.equal(result.status, 0, result.stderr);
          const lock = JSON.parse(await readFile(resolve(consumer, lockName), 'utf8'));
          assert.equal(lock.commit, 'a'.repeat(40));
          assert.equal(lock.sha256, createHash('sha256').update('new-artifact').digest('hex'));
          assert.match(
            lock.artifact,
            /^vendor\/squircle-icons-svelte-0\.1\.0-alpha\.0-[a-f0-9]{12}\.tgz$/,
          );
          assert.equal(
            await readFile(resolve(consumer, 'node_modules/installed.txt'), 'utf8'),
            'file:' + lock.artifact,
          );
          assert.equal(
            (await readdir(resolve(consumer, 'vendor'))).includes('old.tgz'),
            false,
            'Remove the replaced consumer artifact',
          );
        }
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    });
