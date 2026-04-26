# Contributing

## Требования

- Node.js 24+
- `pnpm`

## Локальная настройка

```bash
pnpm install
```

Основные команды разработки:

- `pnpm run dev` — запуск CLI из исходников через `tsx`
- `pnpm run build` — компиляция TypeScript в `dist/`
- `pnpm run typecheck` — проверка TypeScript без emit
- `pnpm run lint` — проверка Biome
- `pnpm run lint:fix` — автоисправления Biome
- `pnpm run test:run` — одиночный прогон тестов
- `pnpm run test:coverage` — тесты с покрытием

## Ожидания к изменениям

- CLI должен оставаться тонким: `src/commands/index.ts` должен прокидывать параметры в core-логику, а не дублировать бизнес-правила.
- Библиотечный API должен оставаться пригодным как для CLI, так и для импортируемого использования.
- Предпочтительны небольшие и сфокусированные изменения вместо широких рефакторингов.

## Тесты

- Для каждого нетривиального изменения парсинга добавляй или обновляй тесты.
- Используй fixture-based тесты из `tests/fixtures/`.
- Не делай CI зависимым от sample PDF из `samples/`.
- Перед открытием PR запускай:

```bash
pnpm run test:run
pnpm run lint
pnpm run typecheck
```

## Изменения extractor-ов

Если ты добавляешь или меняешь extractor:

- зарегистрируй его в списке extractor-ов и selector flow;
- добавь или обнови fixture-файлы и extractor tests;
- проверь поведение balance validation;
- проверь, что masked card fragments вроде `****1234` и технические хвосты документа сохраняются корректно.

Текущие форматы:

- `SBER_DEBIT_2604` — текущий формат по умолчанию
- `SBER_DEBIT_2603` — legacy-совместимость для марта 2026

## Изменения публичного API и упаковки

Если меняется surface пакета:

- обновляй `src/index.ts`;
- обновляй `README.md`;
- при необходимости обновляй `package.json` `exports`.

Пакет публикуется как ESM и поставляет `dist`, `README.md` и `LICENSE`.

## Правила commit и pull request

- Используй Conventional Commits, например `feat:`, `fix:`, `docs:`, `chore:`.
- Держи PR сфокусированными и ясно описывай пользовательские изменения.
- Если меняется поведение парсера, добавляй и тестовые изменения.

Репозиторий использует `release-please`, поэтому commit messages влияют на version bump и генерацию changelog.

## CI и release flow

- `.github/workflows/test.yml` запускается на `pull_request` и делегирует проверки в `.github/workflows/reusable-test.yml`.
- `.github/workflows/reusable-test.yml` запускает install, typecheck, lint, tests и coverage reporting.
- `.github/workflows/npm-publish.yml` содержит интегрированный flow `release-please`: release PR, обновление версии, `CHANGELOG.md`, валидацию release branch и публикацию в npm в том же workflow при создании релиза.

Публикационный guardrail:

```bash
pnpm run test:run && pnpm run lint && pnpm run typecheck && pnpm run build
```

## Если сомневаешься

- Следуй существующим паттернам проекта.
- Предпочитай обновлять тесты и документацию вместе с изменением поведения.
- Держи contributor-facing docs и заметки о release workflow синхронизированными с конфигурацией репозитория.
