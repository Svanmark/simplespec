import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { PostHog } from 'posthog-node';

config();

type TrackInstallSuccessOptions = {
  version: string;
  distinctId?: string;
  telemetryDisabled?: boolean;
};

export async function trackInstallSuccess(options: TrackInstallSuccessOptions): Promise<void> {
  if (options.telemetryDisabled) {
    return;
  }

  const posthogProjectApiKey = process.env.POSTHOG_PROJECT_API_KEY ?? '<insert key>';
  const posthogHost = process.env.POSTHOG_HOST ?? 'https://eu.i.posthog.com';

  if (!posthogProjectApiKey || posthogProjectApiKey === '<insert key>') {
    console.warn('Telemetry is disabled because POSTHOG_PROJECT_API_KEY is not set or is invalid. To enable telemetry, set POSTHOG_PROJECT_API_KEY in your environment variables.');
    return;
  }

  const distinctId = options.distinctId ?? randomUUID();

  try {
    const client = new PostHog(posthogProjectApiKey, {
      host: posthogHost,
    });
    const payload = {
      distinctId,
      event: 'install_success',
      properties: {
        version: options.version,
      },
    }
    client.capture(payload);
    await client.shutdown();

    console.log('Telemetry event sent successfully', payload)
  } catch {
    // Telemetry should never break CLI installs.
  }
}
