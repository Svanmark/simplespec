const runtimes: Record<string, RuntimeInstance> = {};
const registeredRuntimes: Record<string, RuntimeConstructor> = {};

type RuntimeConstructor = new (runtime: string) => RuntimeInstance;

type RuntimeInstance = Runtime;

class Runtime {
  runtime: string;

  constructor(runtime: string) {
    if (new.target === Runtime) {
      throw new Error('Use Runtime.getRuntime() instead of new.');
    }

    this.runtime = runtime;
  }

  install(): void {
    // Shared install behavior for all runtimes goes here.
  }

  uninstall(): void {
    // Shared uninstall behavior for all runtimes goes here.
  }

  static registerRuntime(runtime: string, RuntimeClass: RuntimeConstructor): void {
    registeredRuntimes[runtime] = RuntimeClass;
  }

  static listAvailableRuntimes(): string[] {
    return Object.keys(registeredRuntimes);
  }

  static getRuntime(runtime: string): RuntimeInstance {
    if (!runtimes[runtime]) {
      const RuntimeClass = registeredRuntimes[runtime];

      if (!RuntimeClass) {
        throw new Error(`Runtime "${runtime}" is not registered.`);
      }

      runtimes[runtime] = new RuntimeClass(runtime);
    }

    return runtimes[runtime];
  }
}

export { runtimes };
export default Runtime;
