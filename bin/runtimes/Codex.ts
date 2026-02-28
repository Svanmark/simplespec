import Runtime from './Runtime.ts';

class Codex extends Runtime {
  async install(): Promise<void> {
    await super.install();

    console.log('Installing Codex runtime...')

    await this.symlinkAgentDirectoriesToRuntime('.codex', [{ source: 'skills' }]);

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
