const runtimes: Record<string, RuntimeInstance> = {};
const registeredRuntimes: Record<string, RegisteredRuntime> = {};

type RuntimeConstructor = new (runtime: string) => RuntimeInstance;
type RegisteredRuntime = {
  name: string;
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

  install(): void {
    if (Runtime.globalInstallCompleted) {
      return;
    }

    Runtime.globalInstallCompleted = true;
    console.log('Installing global runtime...');
    // Shared install behavior for all runtimes goes here.
  }

  uninstall(): void {
    // Shared uninstall behavior for all runtimes goes here.
  }

  static registerRuntime(runtime: string, name: string, RuntimeClass: RuntimeConstructor): void {
    registeredRuntimes[runtime] = {
      name,
      RuntimeClass,
    };
  }

  static listAvailableRuntimes(): Array<{ runtime: string; name: string }> {
    return Object.entries(registeredRuntimes).map(([runtime, { name }]) => ({
      runtime,
      name,
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
