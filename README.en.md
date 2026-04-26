# sberparse

Convert Sberbank PDF statements into structured JSON or CSV.

For the Russian version, see [`README.md`](./README.md).

## Installation

> Requires Node.js 24+.

For development and pull request guidelines, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

```bash
pnpm add -g @rvboris/sberparse
```

## Usage

```bash
# Convert to CSV (default)
sberparse ./statement.pdf

# Convert to JSON
sberparse ./statement.pdf -t json

# Write to a specific output name
sberparse ./statement.pdf -o ./output/my-extract

# Force a specific extractor (skip auto-detect)
sberparse ./statement.pdf -f SBER_DEBIT_2604

# Reverse transaction order
sberparse ./statement.pdf -r

# Skip strict balance verification
sberparse ./statement.pdf --no-balance-check

# Save the intermediate extracted text file
sberparse ./statement.pdf --interm
```

### CLI Entrypoints

- dev/source run: `src/cli.ts`
- oclif command: `src/commands/index.ts`
- production bin: `dist/cli.js`

## Library Usage

```ts
import { parsePdf, transactionsToCsv, transactionsToJson } from "@rvboris/sberparse";

const result = await parsePdf("./statement.pdf", {
  reverse: false,
  balance_check: true,
});

const jsonText = transactionsToJson(
  result.transactions,
  result.extractor_name,
  result.errors,
);

const csvText = transactionsToCsv(result.transactions, result.columns_info);
```

### CLI Flags

- `-o, --output` — output file name without extension
- `-f, --format` — force extractor selection
- `-t, --type` — `json` or `csv`
- `-r, --reverse` — reverse transaction order
- `--balance-check` / `--no-balance-check` — enable or disable strict balance verification
- `--interm` — save intermediate text output

## Supported Formats

- `SBER_DEBIT_2604` — April 2026 debit statement format, current default
- `SBER_DEBIT_2603` — March 2026 debit statement format, legacy compatibility

## CI/CD and Workflows

The repository uses two main GitHub Actions entry workflows:

- `Test` — runs on `pull_request` and delegates checks to the reusable test workflow
- `Release Please` — implemented in `.github/workflows/npm-publish.yml`; runs on `push` to `main`, manages the release PR, validates release branches and release commits, creates the GitHub Release, and publishes the package to npm in the same workflow run

Shared validation lives in `.github/workflows/reusable-test.yml`:

- `pnpm install --frozen-lockfile`
- `pnpm run typecheck`
- `pnpm run lint:ci`
- `pnpm run test:coverage`
- coverage summary publication

## Release Flow

Releases are automated with `release-please`.

1. Changes land in `main` with Conventional Commits such as `feat:`, `fix:`, and `chore:`.
2. The `Release Please` workflow opens or updates the release PR.
3. The release PR updates:
   - `package.json` version
   - `CHANGELOG.md`
4. The same workflow finds the current release branch and validates it through the reusable test workflow.
5. After the release PR is merged, `release-please` creates the GitHub Release.
6. If a release is created in that run, the same workflow validates the release commit, builds the package, and publishes it to npm with provenance.

The integrated release workflow remains in `.github/workflows/npm-publish.yml` so it keeps matching the npm trusted publishing configuration for this package.

### Why Release PR Validation Lives in `Release Please`

The release PR is created by GitHub Actions through `GITHUB_TOKEN`, so GitHub does not emit a normal downstream `pull_request` workflow run for that bot-created PR.

Because of that, release PR validation is handled inside `Release Please` itself instead of relying on a separate workflow triggered from the PR event.

## License

MIT
