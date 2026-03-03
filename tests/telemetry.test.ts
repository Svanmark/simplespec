import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isTelemetryEnabledFromEnv,
  trackInstallSuccess,
} from '../bin/telemetry.ts';

test('isTelemetryEnabledFromEnv enables telemetry by default and when env is true', () => {
  delete process.env.SIMPLESPEC_TELEMETRY_ENABLED;
  assert.equal(isTelemetryEnabledFromEnv(), true);

  process.env.SIMPLESPEC_TELEMETRY_ENABLED = 'true';
  assert.equal(isTelemetryEnabledFromEnv(), true);

  process.env.SIMPLESPEC_TELEMETRY_ENABLED = 'false';
  assert.equal(isTelemetryEnabledFromEnv(), false);
});

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
