import { access, cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  symlinkDirectoriesFromAgentsToRuntime,
  type RuntimeDirectorySymlinkMapping,
} from './symlinkDirectories.ts';

const runtimes: Record<string, RuntimeInstance> = {};
const registeredRuntimes: Record<string, RegisteredRuntime> = {};

const FRAMEWORK_BASE_DIRECTORY_MAPPINGS: Array<{ source: string; target: string }> = [
  {
    source: 'skills',
    target: 'skills',
  },
];

const installationDirectory = process.env.INIT_CWD ?? process.cwd();

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveFrameworkBaseSourceDirectory(sourceDirectory: string): Promise<string> {
  const runtimeFileDirectory = dirname(fileURLToPath(import.meta.url));
  const sourceDirectoryCandidates = [
    join(runtimeFileDirectory, '..', '..', sourceDirectory),
    join(runtimeFileDirectory, '..', '..', '..', sourceDirectory),
    join(installationDirectory, sourceDirectory),
  ];

  for (const sourceDirectoryCandidate of sourceDirectoryCandidates) {
    if (await pathExists(sourceDirectoryCandidate)) {
      return sourceDirectoryCandidate;
    }
  }

  throw new Error(`Unable to resolve framework base source directory: ${sourceDirectory}`);
}

async function installFrameworkBaseDirectories(): Promise<void> {
  const agentsDirectory = join(installationDirectory, '.agents');
  await mkdir(agentsDirectory, { recursive: true });

  for (const { source, target } of FRAMEWORK_BASE_DIRECTORY_MAPPINGS) {
    const sourceDirectory = await resolveFrameworkBaseSourceDirectory(source);
    const targetDirectory = join(agentsDirectory, target);

    await cp(sourceDirectory, targetDirectory, {
      recursive: true,
      force: true,
    });
  }
}

type RuntimeConstructor = new (runtime: string) => RuntimeInstance;
type RegisteredRuntime = {
  name: string;
  runtimePath: string;
  RuntimeClass: RuntimeConstructor;
};

type RuntimeInstance = Runtime;

class Runtime {
  runtime: string;
  private static globalInstallCompleted = false;

  constructor(runtime: string) {
    if (new.target === Runtime) {
      throw new Error('Use Runtime.getRuntime() instead of new.');
    }

    this.runtime = runtime;
  }

  async install(): Promise<void> {
    if (Runtime.globalInstallCompleted) {
      return;
    }

    console.log('Installing global runtime...');
    await installFrameworkBaseDirectories();
    Runtime.globalInstallCompleted = true;
  }

  uninstall(): void {
    // Shared uninstall behavior for all runtimes goes here.
  }

  protected async symlinkAgentSkillsToRuntime(runtimeDirectory: string): Promise<void> {
    await this.symlinkAgentDirectoriesToRuntime(runtimeDirectory, [{ source: 'skills' }]);
  }

  protected async symlinkAgentDirectoriesToRuntime(
    runtimeDirectory: string,
    mappings: RuntimeDirectorySymlinkMapping[],
  ): Promise<void> {
    await symlinkDirectoriesFromAgentsToRuntime(runtimeDirectory, mappings);
  }

  static registerRuntime(
    runtime: string,
    name: string,
    runtimePath: string,
    RuntimeClass: RuntimeConstructor,
  ): void {
    registeredRuntimes[runtime] = {
      name,
      runtimePath,
      RuntimeClass,
    };
  }

  static listAvailableRuntimes(): Array<{ runtime: string; name: string; runtimePath: string }> {
    return Object.entries(registeredRuntimes).map(([runtime, { name, runtimePath }]) => ({
      runtime,
      name,
      runtimePath,
    }));
  }

  static getRuntime(runtime: string): RuntimeInstance {
    if (!runtimes[runtime]) {
      const registeredRuntime = registeredRuntimes[runtime];

      if (!registeredRuntime) {
        throw new Error(`Runtime "${runtime}" is not registered.`);
      }

      runtimes[runtime] = new registeredRuntime.RuntimeClass(runtime);
    }

    return runtimes[runtime];
  }
}

export { runtimes };
export default Runtime;
