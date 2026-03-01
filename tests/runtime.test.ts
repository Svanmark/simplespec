import assert from 'node:assert/strict';
import test from 'node:test';
import { lstat, mkdir, mkdtemp, readFile, readlink, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { tmpdir } from 'node:os';

import Runtime from '../bin/runtimes/Runtime.ts';
import { loadRuntimes } from '../bin/runtimes/index.ts';

let idCounter = 0;

function uniqueRuntimeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

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

test('Runtime constructor cannot be called directly', () => {
  assert.throws(() => new (Runtime as unknown as new (runtime: string) => Runtime)('direct'), {
    message: 'Use Runtime.getRuntime() instead of new.',
  });
});

test('registered runtime returns singleton instance and unknown runtime throws', () => {
  class TestRuntime extends Runtime {}

  const runtimeId = uniqueRuntimeId('test-runtime');

  Runtime.registerRuntime(runtimeId, 'Test Runtime', '.test-runtime', TestRuntime);

  const first = Runtime.getRuntime(runtimeId);
  const second = Runtime.getRuntime(runtimeId);

  assert.equal(first, second);
  assert.equal(first.runtime, runtimeId);

  assert.throws(() => Runtime.getRuntime(uniqueRuntimeId('unknown-runtime')), {
    message: /is not registered/,
  });
});

test('loadRuntimes dynamically registers built-in runtimes', async () => {
  await loadRuntimes();

  const runtimes = Runtime.listAvailableRuntimes();

  assert.ok(
    runtimes.some(({ runtime, name, runtimePath }) => runtime === 'codex' && name === 'Codex' && runtimePath === '.codex'),
  );

  assert.ok(
    runtimes.some(
      ({ runtime, name, runtimePath }) => runtime === 'kilocode' && name === 'Kilo Code' && runtimePath === '.kilocode',
    ),
  );
});

test('global install runs once across runtime installs', async () => {
  class InstallRuntime extends Runtime {
    async install(): Promise<void> {
      await super.install();
    }
  }

  (Runtime as unknown as { globalInstallCompleted: boolean }).globalInstallCompleted = false;

  const runtimeId = uniqueRuntimeId('install-runtime');
  Runtime.registerRuntime(runtimeId, 'Install Runtime', '.install-runtime', InstallRuntime);

  const runtime = Runtime.getRuntime(runtimeId);

  const originalConsoleLog = console.log;
  const logs: string[] = [];

  console.log = (...args: unknown[]) => {
    logs.push(args.join(' '));
  };

  try {
    await withTemporaryWorkingDirectory(async () => {
      await runtime.install();
      await runtime.install();
    });
  } finally {
    console.log = originalConsoleLog;
  }

  const globalInstallLogs = logs.filter((log) => log.includes('Installing global runtime...'));
  assert.equal(globalInstallLogs.length, 1);
});

test('global install copies framework base directories to .agents', async () => {
  class InstallFrameworkRuntime extends Runtime {
    async install(): Promise<void> {
      await super.install();
    }
  }

  (Runtime as unknown as { globalInstallCompleted: boolean }).globalInstallCompleted = false;

  const runtimeId = uniqueRuntimeId('install-framework-runtime');
  Runtime.registerRuntime(runtimeId, 'Install Framework Runtime', '.install-framework-runtime', InstallFrameworkRuntime);

  const runtime = Runtime.getRuntime(runtimeId);

  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await runtime.install();

    const sourceCommand = await readFile(new URL('../commands/spec-new.md', import.meta.url), 'utf8');
    const copiedCommand = await readFile(
      join(temporaryWorkingDirectory, '.agents', 'prompts', 'spec-new.md'),
      'utf8',
    );
    assert.equal(copiedCommand, sourceCommand);

    const sourceSimpleSpec = await readFile(new URL('../.simplespec/examples/example-spec.md', import.meta.url), 'utf8');
    const copiedSimpleSpec = await readFile(
      join(temporaryWorkingDirectory, '.simplespec', 'examples', 'example-spec.md'),
      'utf8',
    );
    assert.equal(copiedSimpleSpec, sourceSimpleSpec);
  });
});

test('global install refreshes .agents files and preserves existing .simplespec/specs', async () => {
  class RefreshRuntime extends Runtime {
    async install(): Promise<void> {
      await super.install();
    }
  }

  (Runtime as unknown as { globalInstallCompleted: boolean }).globalInstallCompleted = false;

  const runtimeId = uniqueRuntimeId('refresh-runtime');
  Runtime.registerRuntime(runtimeId, 'Refresh Runtime', '.refresh-runtime', RefreshRuntime);
  const runtime = Runtime.getRuntime(runtimeId);

  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await mkdir(join(temporaryWorkingDirectory, '.agents', 'prompts'), { recursive: true });
    await writeFile(
      join(temporaryWorkingDirectory, '.agents', 'prompts', 'spec-new.md'),
      'stale content',
      'utf8',
    );

    await mkdir(join(temporaryWorkingDirectory, '.simplespec', 'specs'), { recursive: true });
    await writeFile(join(temporaryWorkingDirectory, '.simplespec', 'specs', 'existing-spec.md'), 'keep me', 'utf8');

    await runtime.install();

    const sourceCommand = await readFile(new URL('../commands/spec-new.md', import.meta.url), 'utf8');
    const refreshedCommand = await readFile(
      join(temporaryWorkingDirectory, '.agents', 'prompts', 'spec-new.md'),
      'utf8',
    );
    assert.equal(refreshedCommand, sourceCommand);

    const preservedSpec = await readFile(
      join(temporaryWorkingDirectory, '.simplespec', 'specs', 'existing-spec.md'),
      'utf8',
    );
    assert.equal(preservedSpec, 'keep me');
  });
});

test('runtime directory mappings support custom targets and same-name fallback', async () => {
  class DirectoryMappingRuntime extends Runtime {
    async install(): Promise<void> {
      await super.install();

      await this.symlinkAgentDirectoriesToRuntime('.mapping-runtime', [
        { source: 'prompts', target: 'instructions' },
        { source: 'prompts' },
      ]);
    }
  }

  (Runtime as unknown as { globalInstallCompleted: boolean }).globalInstallCompleted = false;

  const runtimeId = uniqueRuntimeId('directory-mapping-runtime');
  Runtime.registerRuntime(runtimeId, 'Directory Mapping Runtime', '.mapping-runtime', DirectoryMappingRuntime);
  const runtime = Runtime.getRuntime(runtimeId);

  await withTemporaryWorkingDirectory(async (temporaryWorkingDirectory) => {
    await mkdir(join(temporaryWorkingDirectory, '.agents', 'prompts', 'general'), { recursive: true });
    await writeFile(join(temporaryWorkingDirectory, '.agents', 'prompts', 'spec-new.md'), '# Spec New', 'utf8');
    await writeFile(
      join(temporaryWorkingDirectory, '.agents', 'prompts', 'general', 'system.md'),
      '# Prompt',
      'utf8',
    );

    await runtime.install();

    const customTargetSymlinkPath = join(temporaryWorkingDirectory, '.mapping-runtime', 'instructions', 'spec-new.md');
    const customTargetSymlinkStats = await lstat(customTargetSymlinkPath);
    assert.equal(customTargetSymlinkStats.isSymbolicLink(), true);

    const customTargetSymlinkTarget = await readlink(customTargetSymlinkPath);
    assert.equal(isAbsolute(customTargetSymlinkTarget), false);
    assert.equal(customTargetSymlinkTarget, join('..', '..', '.agents', 'prompts', 'spec-new.md'));

    const fallbackTargetSymlinkPath = join(temporaryWorkingDirectory, '.mapping-runtime', 'prompts', 'general');
    const fallbackTargetSymlinkStats = await lstat(fallbackTargetSymlinkPath);
    assert.equal(fallbackTargetSymlinkStats.isSymbolicLink(), true);

    const fallbackTargetSymlinkTarget = await readlink(fallbackTargetSymlinkPath);
    assert.equal(isAbsolute(fallbackTargetSymlinkTarget), false);
    assert.equal(fallbackTargetSymlinkTarget, join('..', '..', '.agents', 'prompts', 'general'));
  });
});
