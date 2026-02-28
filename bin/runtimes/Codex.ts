import Runtime from './Runtime.ts';

class Codex extends Runtime {
  install(): void {
    super.install();

    // Codex runtime-specific install behavior goes here.
  }

  uninstall(): void {
    super.uninstall();

    // Codex runtime-specific uninstall behavior goes here.
  }
}

Runtime.registerRuntime(
  'codex',
  'Codex',
  '.codex',
  Codex
);
export default Codex;
