---
name: spec-apply
description: Implement an existing product/engineering specification using the spec-driven development workflow. Use when asked to apply a spec and deliver implementation-ready code changes.
metadata:
  version: "0.1"
---

# /spec-apply - Implement spec

## Inputs

Input can be either of:

- A spec id (spec:<number>).
  - Browse `.simplespec/specs/` to find the spec file.
- File path to a spec file.
- Empty.
  - Detect spec reference from context (e.g., from a previous message or conversation).

## Outputs

- Implemented code changes that satisfy the selected spec.
- Tests added/updated when the repository has tests or when explicitly requested in the spec/task.
- Validation artifacts from local checks (for example lint/typecheck/tests/build where applicable).
- A concise implementation summary including what was completed, what was verified, and any unresolved blockers.

## Process

1. **Resolve the target spec**
   - If input is a spec id, locate matching file under `.simplespec/specs/`.
   - If input is empty, infer the most recent/active spec reference from context.
   - If no clear target can be resolved, ask a focused follow-up question.

2. **Read and extract implementation scope**
   - Parse: Summary, Goals, Non-goals, Requirements, Acceptance Criteria, and Implementation Tasks.
   - Convert requirements into an execution checklist.
   - Treat ambiguous or conflicting requirements as blockers and ask targeted clarification only when necessary.

3. **Align with repository conventions before coding**
   - Detect language, framework, architecture, and naming/style patterns from existing files.
   - Reuse existing abstractions and patterns before introducing new ones.
   - Prefer minimal, focused diffs that preserve established project structure.

4. **Implement iteratively**
   - Complete work in dependency order.
   - Keep commits/changes scoped to spec requirements and explicit acceptance criteria.
   - Avoid out-of-scope enhancements unless they are required to make the spec implementation correct.

5. **Parallelize with orchestration when beneficial**
   - The skill may orchestrate/spawn multiple agents to implement independent workstreams in parallel.
   - Split by clear boundaries (for example backend, frontend, tests, docs) to minimize merge conflicts.
   - Define contracts up front (shared types/interfaces, acceptance criteria ownership, file boundaries).
   - Reconcile outputs into a single consistent implementation before validation.

6. **Apply testing strategy**
   - If tests exist in the repository, add/update tests to cover all new behavior and relevant edge cases.
   - If the spec or user instruction requires tests, treat tests as mandatory deliverables.
   - Map tests directly to acceptance criteria so each requirement is explicitly verified.
   - Prefer small, focused tests with a single assertion intent (for example filtering, boundary behavior, sorting, validation) over one large mixed scenario.
   - Include both happy path and failure-path coverage (invalid input, missing entities, boundary conditions).
   - Keep tests deterministic (stable fixtures, explicit ordering assertions where ordering matters, no time/network randomness).
   - When one broad test exists, split it into requirement-aligned tests to improve failure diagnosis and maintainability.
   - Run project-appropriate checks (for example test, typecheck, lint, build) and fix issues caused by the implementation.

7. **Frontend verification (when applicable)**
   - For UI/frontend implementations, use the agent browser to validate rendered UI and key user flows.
   - Verify that behavior matches acceptance criteria (including visible states and interaction outcomes).
   - Address UI/functional regressions found during browser validation.

8. **Review and iterate**
   - Perform a short self-review against:
     - Spec requirements and acceptance criteria coverage.
     - Test quality and reliability.
     - Code quality and robustness (error handling/edge cases).
   - Iterate on implementation until no known gaps remain or a clear blocker is documented.

9. **Report completion**
   - Summarize implemented items mapped to acceptance criteria.
   - List tests/checks executed and outcomes.
   - Document any follow-up items explicitly marked out-of-scope or blocked.

## Guardrails

- Do not implement features outside spec scope unless required for correctness.
- Do not skip tests when test infrastructure exists or when testing is explicitly required.
- Do not claim frontend verification without using the browser for frontend work.
- Prefer repository-standard patterns over introducing new architecture.
- Escalate blockers early with precise questions rather than making risky assumptions.
- When parallelizing with multiple agents, always perform a final integration pass to resolve conflicts and ensure end-to-end correctness.
