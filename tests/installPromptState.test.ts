import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveInstallModeSelection, resolveRuntimeSelection } from '../bin/installPromptState.ts';

test('resolveRuntimeSelection returns selected runtimes when prompt is completed', () => {
  const result = resolveRuntimeSelection({
    runtimes: ['codex', 'kilocode'],
  });

  assert.deepEqual(result, {
    runtimes: ['codex', 'kilocode'],
    cancelled: false,
  });
});

test('resolveRuntimeSelection marks cancellation when prompt result is missing runtimes', () => {
  const result = resolveRuntimeSelection({});

  assert.deepEqual(result, {
    runtimes: [],
    cancelled: true,
  });
});

test('resolveInstallModeSelection returns selected mode when prompt is completed', () => {
  const result = resolveInstallModeSelection(
    {
      installMode: 'copy',
    },
    'symlink',
  );

  assert.deepEqual(result, {
    installMode: 'copy',
    cancelled: false,
  });
});

test('resolveInstallModeSelection marks cancellation and keeps fallback mode when prompt result is missing mode', () => {
  const result = resolveInstallModeSelection({}, 'symlink');

  assert.deepEqual(result, {
    installMode: 'symlink',
    cancelled: true,
  });
});
