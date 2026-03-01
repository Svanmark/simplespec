import assert from 'node:assert/strict';
import test from 'node:test';
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
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

test('copy install mode copies codex prompts as regular files', async () => {
  await loadRuntimes();
  (Runtime as unknown as { globalInstallCompleted: boolean }).globalInstallCompleted = false;
  Runtime.configureInstallMode('copy');

  const codexRuntime = Runtime.getRuntime('codex');

  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await codexRuntime.install();

    const promptPath = join(temporaryWorkingDirectory, '.codex', 'prompts', 'spec-new.md');
    const promptStats = await lstat(promptPath);

    assert.equal(promptStats.isFile(), true);
    assert.equal(promptStats.isSymbolicLink(), false);

    const copiedPrompt = await readFile(promptPath, 'utf8');
    const sourcePrompt = await readFile(join(temporaryWorkingDirectory, '.agents', 'prompts', 'spec-new.md'), 'utf8');
    assert.equal(copiedPrompt, sourcePrompt);
  });
});

test('copy install mode copies kilocode workflows and preserves existing local files', async () => {
  await loadRuntimes();
  (Runtime as unknown as { globalInstallCompleted: boolean }).globalInstallCompleted = false;
  Runtime.configureInstallMode('copy');

  const kilocodeRuntime = Runtime.getRuntime('kilocode');

  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await mkdir(join(temporaryWorkingDirectory, '.kilocode', 'workflows'), { recursive: true });
    await writeFile(join(temporaryWorkingDirectory, '.kilocode', 'workflows', 'keep-local.md'), 'local', 'utf8');

    await kilocodeRuntime.install();

    const workflowsPath = join(temporaryWorkingDirectory, '.kilocode', 'workflows');
    const workflowsStats = await lstat(workflowsPath);

    assert.equal(workflowsStats.isDirectory(), true);
    assert.equal(workflowsStats.isSymbolicLink(), false);

    const copiedPrompt = await readFile(join(workflowsPath, 'spec-new.md'), 'utf8');
    const sourcePrompt = await readFile(join(temporaryWorkingDirectory, '.agents', 'prompts', 'spec-new.md'), 'utf8');
    assert.equal(copiedPrompt, sourcePrompt);

    const preservedLocalFile = await readFile(join(workflowsPath, 'keep-local.md'), 'utf8');
    assert.equal(preservedLocalFile, 'local');
  });
});
