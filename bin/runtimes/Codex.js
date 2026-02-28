import Runtime from './Runtime.js';

class Codex extends Runtime {
  install() {
    super.install();

    // Codex runtime-specific install behavior goes here.
  }

  uninstall() {
    super.uninstall();

    // Codex runtime-specific uninstall behavior goes here.
  }
}

Runtime.registerRuntime('codex', Codex);
export default Codex;
