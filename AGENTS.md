# sberparse

TypeScript-пакет и CLI для конвертации PDF-выписок Сбербанка в структурированные данные и выходные файлы JSON/CSV.

## Назначение проекта

Проект решает две задачи:

1. **CLI-утилита** для локальной конвертации PDF-выписки в CSV или JSON.
2. **Импортируемая библиотека** для использования в коде без записи файлов на диск.

Основной npm-пакет: `@rvboris/sberparse`

## Текущий статус

- Пакет опубликован как ESM-библиотека с CLI.
- Актуальный extractor по умолчанию: `SBER_DEBIT_2604`.
- `SBER_DEBIT_2603` сохранён для совместимости с мартовским форматом.
- CLI построен на `oclif` в single-command режиме.
- Логирование реализовано через `logtape` + `@logtape/pretty`.
- Проект использует `pnpm`, `Biome`, `Vitest`, `tsx`, `TypeScript`.
- Минимальная версия Node.js: **24+**.

## Поддерживаемый формат выписки

### Экстракторы

- `SBER_DEBIT_2604` — дебетовая выписка Сбербанка образца апреля 2026, текущий формат по умолчанию.
- `SBER_DEBIT_2603` — дебетовая выписка Сбербанка образца марта 2026, legacy-совместимость.

### Что умеет парсер

- автоопределять формат выписки;
- принудительно выбирать экстрактор;
- извлекать транзакции, баланс периода и метаданные колонок;
- проверять согласованность баланса;
- разворачивать порядок транзакций;
- сериализовать результат в JSON/CSV;
- работать как через CLI, так и как библиотечный API.

## Публичный API библиотеки

Точка входа: `src/index.ts`

Экспортируются:

- `parsePdf` — парсит PDF и возвращает `ExtractorResult` без записи файлов;
- `convertPdf` — парсит PDF и записывает JSON/CSV файл;
- `transactionsToCsv` — сериализует массив транзакций в CSV-строку;
- `transactionsToJson` — сериализует массив транзакций в JSON-строку;
- `Extractor` — базовый класс экстракторов;
- `BalanceVerificationError`, `InputFileStructureError`, `SberParseError`, `UserInputError`;
- типы `CLIOptions`, `ParseOptions`, `ExtractorResult`, `Transaction`.

## CLI

### Точка входа

- dev/source run: `src/cli.ts`
- oclif command: `src/commands/index.ts`
- production bin: `dist/cli.js`

### Поведение CLI

CLI принимает входной PDF-файл и поддерживает флаги:

- `-o, --output` — имя выходного файла без расширения;
- `-f, --format` — принудительный выбор экстрактора;
- `-t, --type` — `json` или `csv`;
- `-r, --reverse` — перевернуть порядок транзакций;
- `--balance-check` / `--no-balance-check` — включить/отключить строгую проверку баланса;
- `--interm` — сохранить промежуточный `.txt` после OCR/text extraction.

### Примеры запуска

```bash
pnpm exec tsx src/cli.ts ./statement.pdf
pnpm exec tsx src/cli.ts ./statement.pdf -t json
pnpm exec tsx src/cli.ts ./statement.pdf -f SBER_DEBIT_2604 --interm
```

После сборки bin-команда пакета:

```bash
sberparse ./statement.pdf
```

## Архитектура

### Основные модули

- `src/converter.ts`  
  Центральная orchestration-логика: чтение PDF, выбор экстрактора, проверка баланса, запись результата, библиотечный API.

- `src/pdf-parser.ts`  
  Обёртка над `pdf-parse` 2.x через `PDFParse`.

- `src/extractor.ts`  
  Базовый класс экстрактора.

- `src/extractor-selector.ts`  
  Автоопределение поддерживаемого формата по входному тексту.

- `src/extractors/sber-debit-2604.ts`  
  Основная реализация актуального парсера выписки.

- `src/extractors/sber-debit-2603.ts`  
  Поддержка предыдущего мартовского формата.

- `src/balance-checker.ts`  
  Проверка согласованности сумм и остатка.

- `src/csv-writer.ts`  
  Генерация CSV-строки и запись CSV-файла.

- `src/json-writer.ts`  
  Генерация JSON-строки и запись JSON-файла.

- `src/logger.ts`  
  Конфигурация логирования через `logtape`.

- `src/types.ts`  
  Контракты публичных типов.

### Поток обработки

1. CLI или библиотека передаёт путь к PDF.
2. `pdfToText()` конвертирует PDF в текст.
3. `determineExtractorAuto()` или `determineExtractorByName()` выбирает экстрактор.
4. Экстрактор извлекает транзакции и баланс периода.
5. Выполняется проверка баланса.
6. Результат:
   - либо возвращается как `ExtractorResult`;
   - либо дополнительно записывается в `.csv` или `.json`.

## Технологический стек

- **Runtime:** Node.js 24+
- **Language:** TypeScript 6
- **Package manager:** pnpm
- **CLI:** oclif 4
- **PDF parsing:** pdf-parse 2.x
- **Logging:** @logtape/logtape, @logtape/pretty
- **Formatting/Lint:** Biome
- **Tests:** Vitest + coverage-v8
- **Dev runner:** tsx

## Сборка и качество

### Основные команды

- `pnpm run dev` — запуск CLI из исходников через `tsx`
- `pnpm run build` — компиляция TypeScript в `dist/`
- `pnpm run typecheck` — проверка типов без эмита
- `pnpm test` — watch mode Vitest
- `pnpm run test:run` — единичный прогон тестов
- `pnpm run test:coverage` — тесты с покрытием
- `pnpm run lint` — проверка Biome
- `pnpm run lint:fix` — автоисправление Biome

### Публикационный guardrail

Перед публикацией выполняется:

```bash
pnpm run test:run && pnpm run lint && pnpm run typecheck && pnpm run build
```

Это зашито в `prepublishOnly`.

## Тесты

Проект покрыт unit/integration тестами для:

- экстракторов;
- выбора экстрактора;
- converter API;
- writers (CSV/JSON);
- balance checker;
- исключений;
- утилит и типов;
- CLI-поведения.

Используются текстовые fixture-файлы в `tests/fixtures/`, а не реальные sample PDF в CI.

## CI/CD

### Workflows

- `.github/workflows/test.yml`
  - запускается на `pull_request`
  - делегирует фактические проверки в reusable workflow

- `.github/workflows/reusable-test.yml`
  - `pnpm install --frozen-lockfile`
  - `pnpm run typecheck`
  - `pnpm run lint:ci`
  - `pnpm run test:coverage`
  - публикация coverage summary

- `.github/workflows/npm-publish.yml`
  - запускается на `push` в `main`
  - использует `release-please-action` с поддержкой Node 24
  - открывает/обновляет release PR
  - находит текущий open release PR branch и прогоняет `reusable-test.yml` в том же run
  - при создании релиза прогоняет `reusable-test.yml` для release commit
  - затем в том же workflow выполняет `pnpm run build` и публикует пакет в npm с `--provenance`
  - при merge release PR обновляет версию, `CHANGELOG.md`, создаёт GitHub Release и завершает npm publish без отдельного downstream workflow

## Release Process

- **Version check first:** Перед подготовкой нового релиза всегда проверять актуальную версию в remote-репозитории и package metadata. После `git fetch` сверять GitHub releases/tags и локальное состояние `package.json` / `.release-please-manifest.json`, чтобы не релизить из устаревшей версии.
- **Do not bump locally:** Для обычных релизов не редактировать вручную `package.json`, `.release-please-manifest.json` и `CHANGELOG.md`. Нужно коммитить фактическое изменение кода или документации с Conventional Commit (`fix:`, `feat:` и т.д.) и пушить его в `main`.
- **Release Please flow:** Пуш в `main` запускает GitHub Actions workflow `.github/workflows/npm-publish.yml`. `release-please` открывает или обновляет release PR обратно в `main` из ветки `release-please--branches--main--components--sberparse`, где обновляет версию, `CHANGELOG.md` и `.release-please-manifest.json`.
- **Publish after merge:** Merge release PR создаёт GitHub release/tag и запускает publish job в том же workflow. Не создавать вручную release tags или GitHub Releases, если автоматизация не сломалась и пользователь явно не одобрил ручной recovery.
- **Verify with gh:** После подготовки релиза или merge release PR всегда проверять статус через GitHub CLI: смотреть release PR, workflow runs и итоговый release/tag командами вроде `gh pr view`, `gh run list`, `gh run watch`, `gh release list` и `gh release view`.

## Packaging

- пакет публикуется как ESM (`"type": "module"`)
- основной entrypoint: `dist/index.js`
- CLI entrypoint: `dist/cli.js`
- `exports` явно описывает:
  - `.` → `types` + `default`
  - `./cli` → `types` + `default`
- публикуются только `dist`, `README.md`, `LICENSE`

## Ключевые проектные договорённости

- Основной актуальный формат сейчас `SBER_DEBIT_2604`; `SBER_DEBIT_2603` поддерживается как ограниченная обратная совместимость.
- При расширении форматов новый extractor должен добавляться как отдельный класс и регистрироваться в selector-е.
- Библиотечный API должен оставаться пригодным для интеграции в другие Node.js-проекты.
- CLI не должен дублировать бизнес-логику — только прокидывать параметры в core API.
- Новые сложные ветки парсинга должны покрываться тестами на fixture-данных.
- Не использовать sample PDF как обязательную зависимость CI.
- Автоматические релизы и `CHANGELOG.md` ведёт `release-please`, starting point: `v1.2.0`.
- Commit messages для пользовательских изменений должны следовать Conventional Commits (`feat:`, `fix:` и т.д.), иначе changelog и version bump будут неполными.

## Что важно помнить при изменениях

- Если меняется surface пакета, обновлять одновременно:
  - `src/index.ts`
  - `README.md`
  - при необходимости `package.json -> exports`

- Если меняется publish/CI-логика, проверять:
  - `test.yml`
  - `reusable-test.yml`
  - `npm-publish.yml`
  - `package.json` scripts

- Если меняется release flow или changelog automation:
  - `CHANGELOG.md`
  - `release-please-config.json`
  - `.release-please-manifest.json`
  - инструкции в `AGENTS.md`

- Если меняется extractor:
  - обновлять fixture-тесты;
  - проверять балансную валидацию;
  - проверять сохранение строк с масками карт (`****1234`) и технических хвостов документа.
