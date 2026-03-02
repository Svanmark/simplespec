import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { config } from 'dotenv';
import { PostHog } from 'posthog-node';

config();

type TrackInstallSuccessOptions = {
  version: string;
  distinctId?: string;
  telemetryDisabled?: boolean;
  installMode?: 'symlink' | 'copy';
  selectedRuntimes?: string[];
  cliFlagsUsed?: string[];
  nodeVersion?: string;
  osPlatform?: NodeJS.Platform;
  osArch?: string;
  country?: string;
};

const TELEMETRY_DIR_PATH = path.join(os.homedir(), '.simplespec');
const TELEMETRY_DISTINCT_ID_PATH = path.join(TELEMETRY_DIR_PATH, 'telemetry-distinct-id');

async function getOrCreatePersistentDistinctId(): Promise<string> {
  try {
    const existingDistinctId = (await readFile(TELEMETRY_DISTINCT_ID_PATH, 'utf8')).trim();
    if (existingDistinctId) {
      return existingDistinctId;
    }
  } catch {
    // No persisted ID yet, create one below.
  }

  const distinctId = randomUUID();

  try {
    await mkdir(TELEMETRY_DIR_PATH, { recursive: true });
    await writeFile(TELEMETRY_DISTINCT_ID_PATH, `${distinctId}\n`, { encoding: 'utf8' });
  } catch {
    // Ignore persistence failures; telemetry should remain best-effort.
  }

  return distinctId;
}

export async function trackInstallSuccess(options: TrackInstallSuccessOptions): Promise<void> {
  if (options.telemetryDisabled) {
    return;
  }

  const posthogProjectApiKey = process.env.POSTHOG_PROJECT_API_KEY ?? '<insert key>';
  const posthogHost = process.env.POSTHOG_HOST ?? 'https://eu.i.posthog.com';

  if (!posthogProjectApiKey || posthogProjectApiKey === '<insert key>') {
    return;
  }

  const distinctId = options.distinctId ?? (await getOrCreatePersistentDistinctId());

  try {
    const client = new PostHog(posthogProjectApiKey, {
      host: posthogHost,
    });

    client.capture({
      distinctId,
      event: 'install_success',
      properties: {
        version: options.version,
        installMode: options.installMode,
        selectedRuntimes: options.selectedRuntimes,
        cliFlagsUsed: options.cliFlagsUsed,
        nodeVersion: options.nodeVersion,
        osPlatform: options.osPlatform,
        osArch: options.osArch,
        country: options.country,
      },
    });

    await client.shutdown();
  } catch {
    // Telemetry should never break CLI installs.
  }
}
