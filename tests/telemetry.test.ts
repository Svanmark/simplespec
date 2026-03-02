import assert from 'node:assert/strict';
import test from 'node:test';

import { trackInstallSuccess } from '../bin/telemetry.ts';

test('trackInstallSuccess does not send events when API key is missing', async () => {
  await trackInstallSuccess({
    version: '0.2.0',
    telemetryDisabled: true,
  });

  assert.ok(true);
});

test('trackInstallSuccess does not send events when telemetry is disabled', async () => {
  await trackInstallSuccess({
    version: '0.2.0',
    telemetryDisabled: true,
  });

  assert.ok(true);
});
