const runtimes = {};
const registeredRuntimes = {};

class Runtime {
  runtime = null;

  constructor(runtime) {
    if (new.target === Runtime) {
      throw new Error("Use Runtime.getSingleton() instead of new.");
    }

    this.runtime = runtime;
  }

  install() {
    // Shared install behavior for all runtimes goes here.
  }

  uninstall() {
    // Shared uninstall behavior for all runtimes goes here.
  }

  static registerRuntime(runtime, RuntimeClass) {
    registeredRuntimes[runtime] = RuntimeClass;
  }

  static getRuntime(runtime) {
    if (!runtimes[runtime]) {
      const RuntimeClass = registeredRuntimes[runtime];

      if (!RuntimeClass) {
        throw new Error(`Runtime \"${runtime}\" is not registered.`);
      }

      runtimes[runtime] = new RuntimeClass(runtime);
    }

    return runtimes[runtime];
  }
}

export { runtimes };
export default Runtime;
