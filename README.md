<p align="center">
  <img src="assets/simplespec-logo-light.png" alt="SimpleSpec logo" width="220" />
</p>

<p align="center">
  <strong>Spec-driven development for teams building with AI.</strong><br />
  Turn rough ideas into clear specs your coding agent can actually execute.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/simplespec">
    <img src="https://img.shields.io/npm/v/simplespec?logo=npm" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/simplespec">
    <img src="https://img.shields.io/npm/dm/simplespec?logo=npm" alt="npm downloads" />
  </a>
  <a href="https://github.com/Svanmark/simplespec/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/Svanmark/simplespec/ci.yml?branch=main&label=tests" alt="unit tests" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/Svanmark/simplespec" alt="license" />
  </a>
</p>

---

## Why SimpleSpec?

Most AI coding workflows break down in the same place: **unclear intent**.

SimpleSpec gives you a lightweight, repeatable structure for defining what to build before generation starts. It helps your agent ship work that is:

- ✅ Aligned with your actual requirements
- ✅ Consistent across features and contributors
- ✅ Easier to review, test, and iterate

---

## What it does

SimpleSpec helps you:

- Create structured feature specifications
- Apply specs in a consistent implementation workflow
- Reduce ambiguity between product ideas and generated code
- Improve output quality from your AI runtime of choice

---

## Quick start

```bash
npx simplespec@latest
```

That’s it. Follow the guided flow and start building with clearer direction.

---

## How to use

### Create a spec

Use this command as your core workflow. This will generate a structured feature specification based on your input.
The agent will ask you for additional details when needed.

**Create a new spec from an idea**
```text
/spec-new Build a task dashboard with filters, sorting, and bulk actions
```
This generates a structured spec under `.simplespec/specs/` with clear requirements, acceptance criteria, and implementation tasks.

   > `/spec-new` will ask if you want to continue directly into implementation.
   
### Implement a spec

Use this command to implement a spec. If the command is sent in the same context as the spec creation, you do not need to specify the spec ID. Otherwise, provide the ID of the spec you want to implement.

```text
/spec-apply spec:<id>
```

---

## Built for the AI era

SimpleSpec is designed for modern, agent-assisted development:

- Human-readable specs
- Repeatable execution patterns
- Better prompts through better structure

When your specs are clear, your code gets better.

---

## License

MIT — see [`LICENSE`](LICENSE).
