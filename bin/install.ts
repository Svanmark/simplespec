#!/usr/bin/env node

import { loadRuntimes } from './runtimes/index.js';
import prompts from 'prompts';
import chalk from 'chalk';
import Runtime from './runtimes/Runtime.js';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import { isTelemetryEnabledFromEnv, trackInstallSuccess } from './telemetry.js';
import { resolveInstallModeSelection, resolveRuntimeSelection } from './installPromptState.js';

await loadRuntimes();

let version = 'unknown';

const context = {
  runtimes: [] as string[],
  installMode: 'symlink' as 'symlink' | 'copy',
  telemetryDisabled: false,
  verbose: false,
};

context.telemetryDisabled = process.argv.includes('--no-telemetry') || !isTelemetryEnabledFromEnv();
context.verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

async function printAsciiLogo() {
  const logoPathCandidates = [
    new URL('../assets/simplespec-logo.txt', import.meta.url),
    new URL('../../assets/simplespec-logo.txt', import.meta.url),
    `${process.cwd()}/assets/simplespec-logo.txt`
  ];

  for (const pathCandidate of logoPathCandidates) {
    try {
      const logo = await readFile(pathCandidate, 'utf8');
      console.log(logo);
      return;
    } catch {
      // Try the next candidate path.
    }
  }

  throw new Error('Unable to load ASCII logo from assets/simplespec-logo.txt');
}

async function printIntro() {
  const packageJsonPathCandidates = [
    new URL('../package.json', import.meta.url),
    new URL('../../package.json', import.meta.url),
    `${process.cwd()}/package.json`
  ];

  for (const pathCandidate of packageJsonPathCandidates) {
    try {
      const packageJsonRaw = await readFile(pathCandidate, 'utf8');
      ({ version } = JSON.parse(packageJsonRaw) as { version: string });
      break;
    } catch {
      // Try the next candidate path.
    }
  }

  console.log(`SimpleSpec ${chalk.gray(`v${version}`)}`);
  console.log(`A simple and lightwiehgt specification framework for AI agents.`)
  console.log(`Installs ${chalk.inverse('./.agents')} directory by default - symlinks to agent specific directories as selected.`);
  console.log('');
}

async function askRuntime() {
  const response = await prompts({
    type: 'multiselect',
    name: 'runtimes',
    instructions: 'Use space to select, enter to confirm (shared .agents is always installed)',
    message: 'Select runtimes to support',
    choices: Runtime.listAvailableRuntimes().map(({ runtime, name }) => ({
      title: name,
      value: runtime
    })),
  });

  const normalizedRuntimeSelection = resolveRuntimeSelection(response);
  context.runtimes = normalizedRuntimeSelection.runtimes;

  return normalizedRuntimeSelection;
}

async function askInstallMode() {
  const response = await prompts({
    type: 'select',
    name: 'installMode',
    message: 'How should runtime prompt directories be installed?',
    choices: [
      {
        title: 'Symlink directories (recommended for new projects and projects without existing custom prompts/commands)',
        value: 'symlink',
      },
      {
        title: 'Copy files (recommended when isolated runtime prompts already exist or are needed)',
        value: 'copy',
      },
    ],
    initial: 0,
  });

  const normalizedInstallModeSelection = resolveInstallModeSelection(response, context.installMode);
  context.installMode = normalizedInstallModeSelection.installMode;

  return normalizedInstallModeSelection;
}

async function installRuntimes() {
  Runtime.configureInstallMode(context.installMode);
  Runtime.configureVerboseLogging(context.verbose);

  if (context.verbose) {
    console.log('[verbose] Verbose install logging enabled');
  }

  if (context.runtimes.length === 0) {
    await Runtime.installGlobalFrameworkOnly();
    return;
  }

  for (const runtime of context.runtimes) {
    const runtimeInstance = Runtime.getRuntime(runtime);
    await runtimeInstance.install();
  }
}

async function run() {
  await printAsciiLogo();
  await printIntro();

  const runtimePromptResult = await askRuntime();

  if (runtimePromptResult.cancelled) {
    console.log(chalk.yellow('Installation cancelled before selecting runtimes.'));
    return;
  }

  const installModePromptResult = await askInstallMode();

  if (installModePromptResult.cancelled) {
    console.log(chalk.yellow('Installation cancelled before selecting install mode.'));
    return;
  }

  await installRuntimes();

  const cliFlagsUsed = process.argv.slice(2).filter((arg) => arg.startsWith('--'));

  void trackInstallSuccess({
    version,
    telemetryDisabled: context.telemetryDisabled,
    verbose: context.verbose,
    installMode: context.installMode,
    selectedRuntimes: context.runtimes,
    cliFlagsUsed,
    nodeVersion: process.version,
    osPlatform: os.platform(),
    osArch: os.arch(),
  });
}

run();
