# SimpleSpec

SimpleSpec is simple, spec-driven framework scaffold focused on installing and managing multiple AI runtimes through a small CLI.

## Current Status

This project is in active bootstrap phase (`v0.0.1`).

Implemented so far:
- TypeScript + NodeNext project setup
- Runtime discovery/registration system
- Interactive runtime selection prompt
- Initial runtime stubs for:
  - `codex`
  - `kilocode`

## What the project currently does

The CLI entrypoint loads available runtime modules, asks which runtimes to install, and stores the selected choices in process context.

Current flow:
1. Dynamically load runtime files from `bin/runtimes`
2. Register each runtime via a shared base class
3. Prompt the user with a multiselect list
4. Capture selected runtimes for later install execution

> Note: Runtime install/uninstall behavior is scaffolded and not yet implemented.

## Project Structure

```text
.
├── assets/
│   └── ascii-logo.png
├── bin/
│   ├── install.ts
│   └── runtimes/
│       ├── Runtime.ts
│       ├── index.ts
│       ├── Codex.ts
│       └── Kilocode.ts
├── commands/
│   └── spec-new.md
├── package.json
└── tsconfig.json
```

## Tech Stack

- TypeScript (`strict` mode)
- Node.js (ES modules via `NodeNext`)
- `prompts` for CLI interaction

## Scripts

- `npm run dev` — run installer directly with `tsx`
- `npm run build` — compile TypeScript to `dist`
- `npm run typecheck` — run type checking with no emit
- `npm run clean` — remove `dist`
- `npm run install:run` — build then run compiled installer

## Local Development

```bash
npm install
npm run dev
```

## Design Notes

### Runtime base class
- Centralized runtime registration (`registerRuntime`)
- Runtime lookup/factory (`getRuntime`)
- Shared lifecycle hooks (`install`, `uninstall`)

### Runtime loading
- `bin/runtimes/index.ts` scans runtime directory
- Includes `.ts`/`.js` files
- Excludes base/internal files (`Runtime`, `index`)
- Dynamically imports each runtime module for self-registration

## Planned Next Steps

- Execute selected runtime installs after prompt
- Implement concrete install/uninstall logic for each runtime
- Add command specs under `commands/` (e.g., `spec-new`)
- Add tests and CI checks
- Expand documentation for usage and architecture

## License

MIT — see `LICENSE`.

