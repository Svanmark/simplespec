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

test('codex install symlinks spec skills into .codex/skills', async () => {
  await loadRuntimes();
  (Runtime as unknown as { globalInstallCompleted: boolean }).globalInstallCompleted = false;
  Runtime.configureInstallMode('symlink');

  const codexRuntime = Runtime.getRuntime('codex');

  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await codexRuntime.install();

    const specNewSkillPath = join(temporaryWorkingDirectory, '.codex', 'skills', 'spec-new', 'SKILL.md');
    const specApplySkillPath = join(temporaryWorkingDirectory, '.codex', 'skills', 'spec-apply', 'SKILL.md');
    const specNewSkillStats = await lstat(specNewSkillPath);
    const specApplySkillStats = await lstat(specApplySkillPath);

    assert.equal(specNewSkillStats.isSymbolicLink(), true);
    assert.equal(specApplySkillStats.isSymbolicLink(), true);

    const specNewSkillTarget = await readlink(specNewSkillPath);
    assert.equal(isAbsolute(specNewSkillTarget), false);
    assert.equal(specNewSkillTarget, join('..', '..', '..', '.agents', 'prompts', 'spec-new.md'));

    const specApplySkillTarget = await readlink(specApplySkillPath);
    assert.equal(isAbsolute(specApplySkillTarget), false);
    assert.equal(specApplySkillTarget, join('..', '..', '..', '.agents', 'prompts', 'spec-apply.md'));
  });
});
