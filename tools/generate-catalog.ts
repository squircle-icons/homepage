import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
const packageCatalog = JSON.parse(
  await readFile(fileURLToPath(import.meta.resolve('@squircle-icons/svelte/catalog.json')), 'utf8'),
);
const icons: {
  name: string;
  description: string;
  tags: string[];
  authorship: string;
  construction: string;
  styles: string[];
}[] = packageCatalog.icons;
const pascal = (name: string) =>
  name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
const destination = new URL('../src/lib/catalog.ts', import.meta.url);
const content = await format(
  '// Generated from the pinned Svelte package catalog. Do not edit.\n' +
    icons
      .map((icon) => `import ${pascal(icon.name)} from '@squircle-icons/svelte/${icon.name}';`)
      .join('\n') +
    '\n' +
    icons
      .filter((icon) => icon.styles.includes('filled'))
      .map(
        (icon) =>
          `import ${pascal(icon.name)}Filled from '@squircle-icons/svelte/filled/${icon.name}';`,
      )
      .join('\n') +
    '\nexport const catalog = [\n' +
    icons
      .map(
        (icon) =>
          `{ ...${JSON.stringify(icon)}, component: ${pascal(icon.name)}, filledComponent: ${icon.styles.includes('filled') ? pascal(icon.name) + 'Filled' : 'undefined'} }`,
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
console.log(`Verified catalog for ${icons.length} package icons.`);
