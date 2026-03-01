import assert from 'node:assert/strict';
import test from 'node:test';
import { lstat, mkdtemp, readlink, rm } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { tmpdir } from 'node:os';

import Runtime from '../bin/runtimes/Runtime.ts';
import { loadRuntimes } from '../bin/runtimes/index.ts';

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

test('codex install symlinks each .agents/prompts entry into .codex/prompts', async () => {
  await loadRuntimes();
  (Runtime as unknown as { globalInstallCompleted: boolean }).globalInstallCompleted = false;

  const codexRuntime = Runtime.getRuntime('codex');

  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await codexRuntime.install();

    const symlinkPath = join(temporaryWorkingDirectory, '.codex', 'prompts', 'spec-new.md');
    const symlinkStats = await lstat(symlinkPath);

    assert.equal(symlinkStats.isSymbolicLink(), true);

    const symlinkTarget = await readlink(symlinkPath);
    assert.equal(isAbsolute(symlinkTarget), false);
    assert.equal(symlinkTarget, join('..', '..', '.agents', 'prompts', 'spec-new.md'));
  });
});
