import { access, cp, mkdir } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  symlinkDirectoriesFromAgentsToRuntime,
} from './symlinkDirectories.ts';
import { copyDirectoriesFromAgentsToRuntime } from './copyFiles.ts';
import type { RuntimeDirectorySymlinkMapping } from './runtimeDirectoryMapping.ts';

const runtimes: Record<string, RuntimeInstance> = {};
const registeredRuntimes: Record<string, RegisteredRuntime> = {};

const FRAMEWORK_BASE_DIRECTORY_MAPPINGS: Array<{ source: string; target: string }> = [
  {
    source: 'commands',
    target: '.agents/prompts',
  },
  {
    source: '.simplespec',
    target: '.simplespec',
  },
];

function getInstallationDirectory(): string {
  const currentWorkingDirectory = process.cwd();
  const initialWorkingDirectory = process.env.INIT_CWD?.trim();
  const npmPackageJsonPath = process.env.npm_package_json;

  if (!initialWorkingDirectory || !npmPackageJsonPath) {
    return currentWorkingDirectory;
  }

  const npmScriptDirectory = dirname(npmPackageJsonPath);

  if (resolve(currentWorkingDirectory) === resolve(npmScriptDirectory)) {
    return initialWorkingDirectory;
  }

  return currentWorkingDirectory;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveFrameworkBaseSourceDirectory(sourceDirectory: string): Promise<string> {
  const installationDirectory = getInstallationDirectory();
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
  const installationDirectory = getInstallationDirectory();

  for (const { source, target } of FRAMEWORK_BASE_DIRECTORY_MAPPINGS) {
    const sourceDirectory = await resolveFrameworkBaseSourceDirectory(source);
    const targetDirectory = join(installationDirectory, target);

    if (resolve(sourceDirectory) === resolve(targetDirectory)) {
      continue;
    }

    await mkdir(dirname(targetDirectory), { recursive: true });

    if (source === '.simplespec') {
      await cp(sourceDirectory, targetDirectory, {
        recursive: true,
        force: true,
        filter: (sourcePath) => {
          const sourceRelativePath = relative(sourceDirectory, sourcePath);

          if (!sourceRelativePath) {
            return true;
          }

          return sourceRelativePath !== 'specs' && !sourceRelativePath.startsWith(`specs${sep}`);
        },
      });

      continue;
    }

    await cp(sourceDirectory, targetDirectory, {
      recursive: true,
      force: true,
    });
  }
}

type RuntimeConstructor = new (runtime: string) => RuntimeInstance;
type RuntimeInstallMode = 'symlink' | 'copy';
type RegisteredRuntime = {
  name: string;
  runtimePath: string;
  RuntimeClass: RuntimeConstructor;
};

type RuntimeInstance = Runtime;

class Runtime {
  runtime: string;
  private static globalInstallCompleted = false;
  private static installMode: RuntimeInstallMode = 'symlink';

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

  protected async symlinkAgentPromptsToRuntime(runtimeDirectory: string): Promise<void> {
    await this.symlinkAgentDirectoriesToRuntime(runtimeDirectory, [{ source: 'prompts' }]);
  }

  protected async symlinkAgentDirectoriesToRuntime(
    runtimeDirectory: string,
    mappings: RuntimeDirectorySymlinkMapping[],
  ): Promise<void> {
    if (Runtime.installMode === 'copy') {
      await copyDirectoriesFromAgentsToRuntime(runtimeDirectory, mappings);
      return;
    }

    await symlinkDirectoriesFromAgentsToRuntime(runtimeDirectory, mappings);
  }

  static configureInstallMode(mode: RuntimeInstallMode): void {
    Runtime.installMode = mode;
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
