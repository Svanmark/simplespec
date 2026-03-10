import Runtime from './Runtime.js';

class Codex extends Runtime {
  async install(): Promise<void> {
    await super.install();

    console.log('Installing Codex runtime...')

    await this.symlinkAgentDirectoriesToRuntime('.codex', [
      {
        source: 'prompts',
        sourceEntry: 'spec-apply.md',
        target: 'skills/spec-apply',
        targetEntry: 'SKILL.md',
      },
      {
        source: 'prompts',
        sourceEntry: 'spec-new.md',
        target: 'skills/spec-new',
        targetEntry: 'SKILL.md',
      },
    ]);

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
