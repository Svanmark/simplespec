import { lstat, mkdir, readdir, rm, symlink } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

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

async function symlinkDirectoriesFromAgentsToRuntime(
  runtimeDirectory: string,
  mappings: RuntimeDirectorySymlinkMapping[],
): Promise<void> {
  for (const mapping of mappings) {
    const installationDirectory = getInstallationDirectory();
    const sourceDirectoryName = mapping.source;
    const targetDirectoryName = mapping.target ?? mapping.source;

    const sourceDirectory = join(installationDirectory, '.agents', sourceDirectoryName);
    const targetDirectory = join(installationDirectory, runtimeDirectory, targetDirectoryName);

    if (mapping.linkMode === 'directory') {
      await mkdir(dirname(targetDirectory), { recursive: true });

      try {
        await lstat(targetDirectory);
        await rm(targetDirectory, { recursive: true, force: true });
      } catch {
        // Target does not exist yet.
      }

      const relativeSourceDirectoryPath = relative(dirname(targetDirectory), sourceDirectory);

      if (isAbsolute(relativeSourceDirectoryPath)) {
        throw new Error(`Expected relative symlink target, but got: ${relativeSourceDirectoryPath}`);
      }

      await symlink(relativeSourceDirectoryPath, targetDirectory, 'dir');
      continue;
    }

    await mkdir(targetDirectory, { recursive: true });

    const entries = await readdir(sourceDirectory, { withFileTypes: true });

    for (const entry of entries) {
      const sourceEntryPath = join(sourceDirectory, entry.name);
      const targetEntryPath = join(targetDirectory, entry.name);

      try {
        await lstat(targetEntryPath);
        await rm(targetEntryPath, { recursive: true, force: true });
      } catch {
        // Target does not exist yet.
      }

      const relativeSourceEntryPath = relative(targetDirectory, sourceEntryPath);

      if (isAbsolute(relativeSourceEntryPath)) {
        throw new Error(`Expected relative symlink target, but got: ${relativeSourceEntryPath}`);
      }

      const symlinkType = entry.isDirectory() ? 'dir' : 'file';
      await symlink(relativeSourceEntryPath, targetEntryPath, symlinkType);
    }
  }
}

export { symlinkDirectoriesFromAgentsToRuntime };
