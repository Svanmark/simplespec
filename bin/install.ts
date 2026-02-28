import { loadRuntimes } from './runtimes/index.ts';
import prompts from 'prompts';
import Runtime from './runtimes/Runtime.ts';

await loadRuntimes();

const context = {
  runtimes: []
};

async function askRuntime() {
  const response = await prompts({
    type: 'multiselect',
    name: 'runtimes',
    message: 'Select runtimes to install',
    choices: Runtime.listAvailableRuntimes().map(runtime => ({
      title: runtime,
      value: runtime
    })),
  });

  context.runtimes = response.runtimes;

  return response;
}

async function run() {
  await askRuntime();
}

run();
