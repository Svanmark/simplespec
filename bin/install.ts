import { loadRuntimes } from './runtimes/index.ts';
import prompts from 'prompts';
import chalk from 'chalk';
import Runtime from './runtimes/Runtime.ts';
import { readFile } from 'node:fs/promises';

await loadRuntimes();

const context = {
  runtimes: []
};

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
  const packageJsonPath = new URL('../package.json', import.meta.url);
  const packageJsonRaw = await readFile(packageJsonPath, 'utf8');
  const { version } = JSON.parse(packageJsonRaw) as { version: string };

  console.log(`SimpleSpec ${chalk.gray(`v${version}`)}`);
  console.log(`A simple and lightwiehgt specification framework for AI agents.`)
  console.log(`Installs ${chalk.inverse('./.agents')} directory by default - symlinks to agent specific directories as selected.`);
  console.log('');
}

async function askRuntime() {
  const response = await prompts({
    type: 'multiselect',
    name: 'runtimes',
    instructions: 'Use space to select, enter to confirm',
    message: 'Select runtimes to support',
    choices: Runtime.listAvailableRuntimes().map(({ runtime, name }) => ({
      title: name,
      value: runtime
    })),
  });

  context.runtimes = response.runtimes;

  return response;
}

async function installRuntimes() {
  for (const runtime of context.runtimes) {
    const runtimeInstance = Runtime.getRuntime(runtime);
    await runtimeInstance.install();
  }
}

async function run() {
  await printAsciiLogo();
  await printIntro();
  await askRuntime();
  await installRuntimes();
}

run();
