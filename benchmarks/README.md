# Feature Benchmark Project

This benchmark setup helps you compare **SimpleSpec**, **OpenSpec**, and **SpecKit** on the exact same implementation task.

## Goal

Measure each framework on:

1. **Token usage** required to complete the feature
2. **Outcome quality** of the implementation

## Benchmark format

You will run the same flow three times, once per framework:

1. Start from the same baseline project in `benchmarks/feature-benchmark/base-project`.
2. Choose request mode:
   - **Strict prompt**: `FEATURE_REQUEST.md`
   - **Vague prompt**: `VAGUE_FEATURE_REQUEST.md`
3. Give the framework exactly one of those requests.
4. Track token usage from the framework UI/logs.
5. Run tests.
6. Evaluate output quality using `QUALITY_RUBRIC.md`.

## Folder structure

```text
benchmarks/feature-benchmark/
├── README.md
├── FEATURE_REQUEST.md
├── QUALITY_RUBRIC.md
└── base-project/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts
    │   └── taskStore.ts
    └── tests/
        └── taskStore.test.ts
```

## Quick start

```bash
cd benchmarks/feature-benchmark/base-project
npm install
npm test
```

Baseline should pass before any framework modifies code.

## Suggested benchmark process

For each framework:

1. Copy `base-project` to a new working folder, e.g. `runs/simplespec-run-1`.
2. Provide the feature request exactly as written in `FEATURE_REQUEST.md`.
3. Do not manually edit code while the framework is generating.
4. Capture:
   - total tokens used
   - test result (`pass/fail`)
   - manual quality score from `QUALITY_RUBRIC.md`

## Suggested result table

| Framework | Tokens | Tests Pass | Correctness (1-5) | Code Quality (1-5) | Robustness (1-5) | Notes |
|---|---:|---|---:|---:|---:|---|
| SimpleSpec |  |  |  |  |  |  |
| OpenSpec |  |  |  |  |  |  |
| SpecKit |  |  |  |  |  |  |
