import { readdir } from 'node:fs/promises';
import { dirname, extname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RUNTIME_FILE_EXTENSIONS = new Set(['.js', '.ts']);
const EXCLUDED_RUNTIME_FILES = new Set(['Runtime', 'index']);

async function loadRuntimes() {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFilePath);

  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const extension = extname(entry.name);
    const fileNameWithoutExtension = basename(entry.name, extension);

    if (!RUNTIME_FILE_EXTENSIONS.has(extension)) {
      continue;
    }

    if (EXCLUDED_RUNTIME_FILES.has(fileNameWithoutExtension)) {
      continue;
    }

    await import(pathToFileURL(`${currentDir}/${entry.name}`).href);
  }
}

export { loadRuntimes };
