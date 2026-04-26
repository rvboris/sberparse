# sberparse

Конвертация PDF-выписок Сбербанка в структурированные JSON и CSV.

Английская версия: [`README.en.md`](./README.en.md).

## Установка

> Требуется Node.js 24+.

Правила разработки и pull request описаны в [`CONTRIBUTING.md`](./CONTRIBUTING.md).

```bash
pnpm add -g @rvboris/sberparse
```

## Использование

```bash
# Конвертация в CSV (по умолчанию)
sberparse ./statement.pdf

# Конвертация в JSON
sberparse ./statement.pdf -t json

# Запись в конкретное имя выходного файла
sberparse ./statement.pdf -o ./output/my-extract

# Принудительный выбор extractor-а без автоопределения
sberparse ./statement.pdf -f SBER_DEBIT_2604

# Обратный порядок транзакций
sberparse ./statement.pdf -r

# Отключить строгую проверку баланса
sberparse ./statement.pdf --no-balance-check

# Сохранить промежуточный текстовый файл
sberparse ./statement.pdf --interm
```

### Точки входа CLI

- запуск из исходников: `src/cli.ts`
- команда oclif: `src/commands/index.ts`
- production bin: `dist/cli.js`

## Использование как библиотеки

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

### Флаги CLI

- `-o, --output` — имя выходного файла без расширения
- `-f, --format` — принудительный выбор extractor-а
- `-t, --type` — `json` или `csv`
- `-r, --reverse` — развернуть порядок транзакций
- `--balance-check` / `--no-balance-check` — включить или отключить строгую проверку баланса
- `--interm` — сохранить промежуточный текст

## Поддерживаемые форматы

- `SBER_DEBIT_2604` — формат дебетовой выписки апреля 2026, текущий по умолчанию
- `SBER_DEBIT_2603` — формат дебетовой выписки марта 2026, legacy-совместимость

## CI/CD и workflow

В репозитории есть два основных входных workflow GitHub Actions:

- `Test` — запускается на `pull_request` и делегирует проверки в reusable test workflow
- `Release Please` — реализован в `.github/workflows/npm-publish.yml`; запускается на `push` в `main`, ведёт release PR, валидирует release branch и release commit, создаёт GitHub Release и публикует пакет в npm в том же workflow run

Общие проверки вынесены в `.github/workflows/reusable-test.yml`:

- `pnpm install --frozen-lockfile`
- `pnpm run typecheck`
- `pnpm run lint:ci`
- `pnpm run test:coverage`
- публикация summary по coverage

## Как работает релиз

Релизы автоматизированы через `release-please`.

1. Изменения попадают в `main` с Conventional Commits, например `feat:`, `fix:` и `chore:`.
2. Workflow `Release Please` открывает или обновляет release PR.
3. В release PR обновляются:
   - версия в `package.json`
   - `CHANGELOG.md`
4. Тот же workflow находит текущую release branch и валидирует её через reusable test workflow.
5. После merge release PR `release-please` создаёт GitHub Release.
6. Если релиз создан в этом run, тот же workflow валидирует release commit, собирает пакет и публикует его в npm с provenance.

Интегрированный release workflow остаётся в `.github/workflows/npm-publish.yml`, потому что именно это имя файла соответствует текущей настройке npm trusted publishing для пакета.

## Лицензия

MIT
