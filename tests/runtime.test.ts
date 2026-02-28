import assert from 'node:assert/strict';
import test from 'node:test';

import Runtime from '../bin/runtimes/Runtime.ts';
import { loadRuntimes } from '../bin/runtimes/index.ts';

let idCounter = 0;

function uniqueRuntimeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
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

test('global install runs once across runtime installs', () => {
  class InstallRuntime extends Runtime {
    install(): void {
      super.install();
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
    runtime.install();
    runtime.install();
  } finally {
    console.log = originalConsoleLog;
  }

  const globalInstallLogs = logs.filter((log) => log.includes('Installing global runtime...'));
  assert.equal(globalInstallLogs.length, 1);
});
