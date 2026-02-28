import { readdir } from 'node:fs/promises';
import { dirname, extname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);

const entries = await readdir(currentDir, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isFile()) {
    continue;
  }

  const extension = extname(entry.name);
  const fileName = basename(entry.name);

  if (extension !== '.js') {
    continue;
  }

  if (fileName === 'Runtime.js' || fileName === 'index.js') {
    continue;
  }

  await import(pathToFileURL(`${currentDir}/${entry.name}`).href);
}
