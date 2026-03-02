import { build } from 'esbuild';
import dotenv from 'dotenv';
import { readdir } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';

const BIN_DIRECTORY = resolve('bin');
const DIST_BIN_DIRECTORY = resolve('dist/bin');
const BUILD_ENV_FILE = resolve('.env.build');

async function collectTypeScriptEntryPoints(directoryPath: string): Promise<string[]> {
  const directoryEntries = await readdir(directoryPath, { withFileTypes: true });
  const entryPoints: string[] = [];

  for (const entry of directoryEntries) {
    const entryPath = join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      entryPoints.push(...(await collectTypeScriptEntryPoints(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.ts')) {
      entryPoints.push(entryPath);
    }
  }

  return entryPoints;
}

async function runBuild(): Promise<void> {
  const envLoadResult = dotenv.config({ path: BUILD_ENV_FILE });

  if (envLoadResult.error) {
    console.warn('No .env.build file found. Using safe placeholder telemetry key.');
  }

  const posthogProjectApiKey = process.env.POSTHOG_PROJECT_API_KEY ?? 'phc_REPLACE_ME';
  const posthogHost = process.env.POSTHOG_HOST ?? 'https://eu.i.posthog.com';

  const entryPoints = await collectTypeScriptEntryPoints(BIN_DIRECTORY);
  const relativeEntryPoints = entryPoints.map((entryPoint) => relative(resolve('.'), entryPoint));

  await build({
    entryPoints: relativeEntryPoints,
    outbase: 'bin',
    outdir: DIST_BIN_DIRECTORY,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    bundle: false,
    sourcemap: false,
    define: {
      'process.env.POSTHOG_PROJECT_API_KEY': JSON.stringify(posthogProjectApiKey),
      'process.env.POSTHOG_HOST': JSON.stringify(posthogHost),
    },
  });
}

await runBuild();

