import { lstat, mkdir, readdir, rm, symlink } from 'node:fs/promises';
import { isAbsolute, join, relative } from 'node:path';

type RuntimeDirectorySymlinkMapping = {
  source: string;
  target?: string;
};

async function symlinkDirectoriesFromAgentsToRuntime(
  runtimeDirectory: string,
  mappings: RuntimeDirectorySymlinkMapping[],
): Promise<void> {
  for (const mapping of mappings) {
    const sourceDirectoryName = mapping.source;
    const targetDirectoryName = mapping.target ?? mapping.source;

    const sourceDirectory = join(process.cwd(), '.agents', sourceDirectoryName);
    const targetDirectory = join(process.cwd(), runtimeDirectory, targetDirectoryName);

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

export type { RuntimeDirectorySymlinkMapping };
export { symlinkDirectoriesFromAgentsToRuntime };
