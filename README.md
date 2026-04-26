# sberparse

Конвертация выписок Сбербанка из PDF в JSON/CSV формат.

## Установка

> Package note: requires Node.js 24+.

For development and pull request guidelines, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

```bash
pnpm add -g @rvboris/sberparse
```

## Использование

```bash
# Конвертация в CSV (по умолчанию)
 sberparse ./vypiska.pdf

# Конвертация в JSON
 sberparse ./vypiska.pdf -t json

# Указать конкретный выходной файл
 sberparse ./vypiska.pdf -o ./output/my-extract

# Принудительный формат (skip auto-detect)
 sberparse ./vypiska.pdf -f SBER_DEBIT_2604

# Обратный порядок транзакций
 sberparse ./vypiska.pdf -r

# Игнорировать результаты сверки баланса
 sberparse ./vypiska.pdf --no-balance-check

# Сохранить промежуточный текстовый файл
 sberparse ./vypiska.pdf --interm
```

### CLI entrypoints

- dev/source run: `src/cli.ts`
- oclif command: `src/commands/index.ts`
- production bin: `dist/cli.js`

## Использование в коде

Main named exports:
- `parsePdf`
- `convertPdf`
- `transactionsToCsv`
- `transactionsToJson`
- `Extractor`
- `BalanceVerificationError`
- `InputFileStructureError`
- `SberParseError`
- `UserInputError`
- types: `CLIOptions`, `ParseOptions`, `ExtractorResult`, `Transaction`

```ts
import { parsePdf, transactionsToCsv, transactionsToJson } from "@rvboris/sberparse";

const result = await parsePdf("./vypiska.pdf", {
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

### CLI flags

- `-o, --output` — output file name without extension
- `-f, --format` — force extractor selection
- `-t, --type` — `json` or `csv`
- `-r, --reverse` — reverse transactions order
- `--balance-check` / `--no-balance-check` — enable/disable strict balance verification
- `--interm` — save intermediate text output

## Поддерживаемые форматы

- SBER_DEBIT_2604 - Дебетовая карта образца апреля 2026 (текущий формат)
- SBER_DEBIT_2603 - Дебетовая карта образца марта 2026

## CI/CD и workflow

В репозитории используются три основных GitHub Actions workflow:

- `Test` — запускается на `pull_request` и прогоняет проверки через reusable workflow.
- `Release Please` — запускается на `push` в `main`, ведёт release PR, `CHANGELOG.md` и версию пакета.
- `Publish to npm` — запускается на `release.created`, повторно прогоняет проверки, собирает пакет и публикует его в npm.

Общие проверки вынесены в reusable workflow `.github/workflows/reusable-test.yml`:

- `pnpm install --frozen-lockfile`
- `pnpm run typecheck`
- `pnpm run lint:ci`
- `pnpm run test:coverage`
- публикация coverage summary

## Как работает релиз

Релизы автоматизированы через `release-please`.

1. Изменения попадают в `main` с Conventional Commits (`feat:`, `fix:`, `chore:` и т.д.).
2. Workflow `Release Please` открывает или обновляет release PR.
3. В release PR автоматически обновляются:
   - `package.json` version
   - `CHANGELOG.md`
4. После этого тот же workflow находит текущую release-ветку и прогоняет для неё reusable test workflow.
5. После merge release PR `release-please` создаёт GitHub Release.
6. Событие `release.created` запускает `Publish to npm`, который:
   - повторно прогоняет проверки,
   - выполняет `pnpm run build`,
   - публикует пакет через `pnpm publish --provenance --access public`.

### Важная особенность release PR

Release PR создаётся самим GitHub Actions workflow через `GITHUB_TOKEN`, поэтому стандартный `pull_request` workflow не получает отдельный check run на странице этого PR.

Из-за этого валидация release PR выполняется внутри самого workflow `Release Please`, а не отдельным downstream-trigger на событие `pull_request`.

## Лицензия

MIT
