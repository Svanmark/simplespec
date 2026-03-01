import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import type { RuntimeDirectorySymlinkMapping } from './runtimeDirectoryMapping.ts';

function getInstallationDirectory(): string {
  const currentWorkingDirectory = process.cwd();
  const initialWorkingDirectory = process.env.INIT_CWD?.trim();
  const npmPackageJsonPath = process.env.npm_package_json;

  if (!initialWorkingDirectory || !npmPackageJsonPath) {
    return currentWorkingDirectory;
  }

  const npmScriptDirectory = dirname(npmPackageJsonPath);

  if (resolve(currentWorkingDirectory) === resolve(npmScriptDirectory)) {
    return initialWorkingDirectory;
  }

  return currentWorkingDirectory;
}

async function copyDirectoriesFromAgentsToRuntime(
  runtimeDirectory: string,
  mappings: RuntimeDirectorySymlinkMapping[],
): Promise<void> {
  for (const mapping of mappings) {
    const installationDirectory = getInstallationDirectory();
    const sourceDirectoryName = mapping.source;
    const targetDirectoryName = mapping.target ?? mapping.source;

    const sourceDirectory = join(installationDirectory, '.agents', sourceDirectoryName);
    const targetDirectory = join(installationDirectory, runtimeDirectory, targetDirectoryName);

    await mkdir(targetDirectory, { recursive: true });

    const copyEntries = async (sourcePath: string, targetPath: string): Promise<void> => {
      const entries = await readdir(sourcePath, { withFileTypes: true });

      for (const entry of entries) {
        const sourceEntryPath = join(sourcePath, entry.name);
        const targetEntryPath = join(targetPath, entry.name);

        if (entry.isDirectory()) {
          await mkdir(targetEntryPath, { recursive: true });
          await copyEntries(sourceEntryPath, targetEntryPath);
          continue;
        }

        await mkdir(dirname(targetEntryPath), { recursive: true });
        await copyFile(sourceEntryPath, targetEntryPath);
      }
    };

    await copyEntries(sourceDirectory, targetDirectory);
  }
}

export { copyDirectoriesFromAgentsToRuntime };
