import assert from 'node:assert/strict';
import test from 'node:test';
import { lstat, mkdir, mkdtemp, readlink, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { tmpdir } from 'node:os';

import { symlinkDirectoriesFromAgentsToRuntime } from '../bin/runtimes/symlinkDirectories.ts';

async function withTemporaryWorkingDirectory(run: (temporaryWorkingDirectory: string) => Promise<void>): Promise<void> {
  const temporaryWorkingDirectory = await mkdtemp(join(tmpdir(), 'simplespec-'));
  const originalWorkingDirectory = process.cwd();

  process.chdir(temporaryWorkingDirectory);

  try {
    await run(temporaryWorkingDirectory);
  } finally {
    process.chdir(originalWorkingDirectory);
    await rm(temporaryWorkingDirectory, { recursive: true, force: true });
  }
}

test('symlink utility maps source to custom target and keeps symlink relative', async () => {
  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await mkdir(join(temporaryWorkingDirectory, '.agents', 'prompts', 'spec-new'), { recursive: true });

    await symlinkDirectoriesFromAgentsToRuntime('.runtime', [{ source: 'prompts', target: 'instructions' }]);

    const symlinkPath = join(temporaryWorkingDirectory, '.runtime', 'instructions', 'spec-new');
    const symlinkStats = await lstat(symlinkPath);

    assert.equal(symlinkStats.isSymbolicLink(), true);

    const symlinkTarget = await readlink(symlinkPath);
    assert.equal(isAbsolute(symlinkTarget), false);
    assert.equal(symlinkTarget, join('..', '..', '.agents', 'prompts', 'spec-new'));
  });
});

test('symlink utility uses same-name target when mapping target is omitted', async () => {
  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await mkdir(join(temporaryWorkingDirectory, '.agents', 'prompts', 'general'), { recursive: true });

    await symlinkDirectoriesFromAgentsToRuntime('.runtime', [{ source: 'prompts' }]);

    const symlinkPath = join(temporaryWorkingDirectory, '.runtime', 'prompts', 'general');
    const symlinkStats = await lstat(symlinkPath);

    assert.equal(symlinkStats.isSymbolicLink(), true);

    const symlinkTarget = await readlink(symlinkPath);
    assert.equal(isAbsolute(symlinkTarget), false);
    assert.equal(symlinkTarget, join('..', '..', '.agents', 'prompts', 'general'));
  });
});

test('symlink utility replaces existing target entries before relinking', async () => {
  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await mkdir(join(temporaryWorkingDirectory, '.agents', 'prompts', 'general'), { recursive: true });
    await mkdir(join(temporaryWorkingDirectory, '.runtime', 'prompts', 'general'), { recursive: true });
    await writeFile(join(temporaryWorkingDirectory, '.runtime', 'prompts', 'general', 'legacy.md'), 'legacy', 'utf8');

    await symlinkDirectoriesFromAgentsToRuntime('.runtime', [{ source: 'prompts' }]);

    const targetEntry = join(temporaryWorkingDirectory, '.runtime', 'prompts', 'general');
    const targetStats = await lstat(targetEntry);

    assert.equal(targetStats.isSymbolicLink(), true);
    const symlinkTarget = await readlink(targetEntry);
    assert.equal(symlinkTarget, join('..', '..', '.agents', 'prompts', 'general'));
  });
});

test('symlink utility supports directory-level symlink mode', async () => {
  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await mkdir(join(temporaryWorkingDirectory, '.agents', 'prompts', 'general'), { recursive: true });

    await symlinkDirectoriesFromAgentsToRuntime('.runtime', [
      { source: 'prompts', target: 'workflows', linkMode: 'directory' },
    ]);

    const symlinkPath = join(temporaryWorkingDirectory, '.runtime', 'workflows');
    const symlinkStats = await lstat(symlinkPath);

    assert.equal(symlinkStats.isSymbolicLink(), true);

    const symlinkTarget = await readlink(symlinkPath);
    assert.equal(isAbsolute(symlinkTarget), false);
    assert.equal(symlinkTarget, join('..', '.agents', 'prompts'));
  });
});
