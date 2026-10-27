import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { selectCatalog } from './catalog-selection.js';
const packageCatalog = JSON.parse(
  await readFile(fileURLToPath(import.meta.resolve('@squircle-icons/svelte/catalog.json')), 'utf8'),
);
const sourceIcons: {
  name: string;
  description: string;
  tags: string[];
  authorship: string;
  construction: string;
  styles: string[];
  reviewStatus: string;
}[] = packageCatalog.icons;
const pascal = (name: string) =>
  name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
for (const mode of ['outline', 'public'] as const) {
  const icons = selectCatalog(sourceIcons, mode);
  const packageName = '@squircle-icons/svelte';
  const destination = new URL(
    `../src/lib/${mode === 'outline' ? 'outline-catalog' : 'public-catalog'}.ts`,
    import.meta.url,
  );
  const content = await format(
    '// Generated from the pinned Svelte package catalogs. Do not edit.\n' +
      `import type { Component } from 'svelte';\nimport type { IconProps } from '${packageName}';\n` +
      icons
        .map((icon) => `import ${pascal(icon.name)} from '${packageName}/${icon.name}';`)
        .join('\n') +
      '\n' +
      `\nexport const catalog = [\n` +
      icons
        .map(
          (icon) =>
            `{ ...${JSON.stringify(icon)}, component: ${pascal(icon.name)} as Component<IconProps> }`,
        )
        .join(',\n') +
      '\n];\n' +
      `export const strokeWeights = ${JSON.stringify(packageCatalog.strokeWeights)};\n`,
    { ...(await resolveConfig('.prettierrc.json')), filepath: fileURLToPath(destination) },
  );
  if (process.argv.includes('--check')) {
    if ((await readFile(destination, 'utf8')) !== content)
      throw new Error('Stale homepage catalog. Run pnpm generate.');
  } else {
    await mkdir(new URL('../src/lib/', import.meta.url), { recursive: true });
    await writeFile(destination, content);
  }
}
const countDestination = new URL('../src/lib/catalog-count.ts', import.meta.url);
const countContent =
  '// Generated from the pinned Svelte package catalogs. Do not edit.\n' +
  `export const iconCount = ${selectCatalog(sourceIcons, 'public').length};\n`;
if (process.argv.includes('--check')) {
  if ((await readFile(countDestination, 'utf8')) !== countContent)
    throw new Error('Stale homepage count. Run pnpm generate.');
} else await writeFile(countDestination, countContent);
console.log(
  `Verified public and featured catalogs for ${sourceIcons.length} released package icons.`,
);
