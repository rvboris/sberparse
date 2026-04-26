# Contributing

Thanks for contributing to `sberparse`.

## Prerequisites

- Node.js 24+
- `pnpm`

## Local Setup

```bash
pnpm install
```

Main development commands:

- `pnpm run dev` — run the CLI from source via `tsx`
- `pnpm run build` — compile TypeScript to `dist/`
- `pnpm run typecheck` — run TypeScript checks without emit
- `pnpm run lint` — run Biome checks
- `pnpm run lint:fix` — apply Biome fixes
- `pnpm run test:run` — run tests once
- `pnpm run test:coverage` — run tests with coverage

## Development Expectations

- Keep CLI behavior thin: `src/commands/index.ts` should pass options into core logic instead of duplicating business rules.
- Preserve the library API so the package stays usable both as CLI and as an imported module.
- Prefer small, focused changes over broad refactors.

## Tests

- Add or update tests for every non-trivial parsing change.
- Use fixture-based tests from `tests/fixtures/`.
- Do not make CI depend on sample PDF files from `samples/`.
- Before opening a PR, run:

```bash
pnpm run test:run
pnpm run lint
pnpm run typecheck
```

## Extractor Changes

If you add or modify an extractor:

- register it in the extractor list and selector flow;
- add or update fixture files and extractor tests;
- verify balance validation behavior;
- verify masked card fragments such as `****1234` and technical trailing lines are preserved correctly.

Current formats:

- `SBER_DEBIT_2604` — current default format
- `SBER_DEBIT_2603` — legacy March 2026 compatibility

## Public API and Packaging Changes

If you change the package surface:

- update `src/index.ts`;
- update `README.md`;
- update `package.json` `exports` if needed.

The package is published as ESM and ships `dist`, `README.md`, and `LICENSE`.

## Commit and Pull Request Rules

- Use Conventional Commits such as `feat:`, `fix:`, `docs:`, `chore:`.
- Keep PRs focused and explain user-visible behavior changes clearly.
- Include test updates when parser behavior changes.

This repository uses `release-please`, so commit messages affect version bumps and changelog generation.

## CI and Release Flow

- `.github/workflows/test.yml` runs on `pull_request` and delegates checks to `.github/workflows/reusable-test.yml`.
- `.github/workflows/reusable-test.yml` runs install, typecheck, lint, tests, and coverage reporting.
- `.github/workflows/release-please.yml` manages release PRs, version updates, and `CHANGELOG.md`.
- `.github/workflows/npm-publish.yml` runs on `release.created`, re-validates the repo, builds it, and publishes to npm.

Release guardrail:

```bash
pnpm run test:run && pnpm run lint && pnpm run typecheck && pnpm run build
```

## When in Doubt

- Follow existing project patterns.
- Prefer updating tests and docs together with behavior changes.
- Keep contributor-facing docs and release workflow notes in sync with the repository configuration.
