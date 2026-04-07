Sberbank PDF statement parser (CLI) с конвертацией в JSON/CSV.

Текущее состояние
- TypeScript CLI в `src/` с pdf-parse для PDF -> text
- oclif CLI (single command) и логирование через logtape/pretty
- pnpm, Node.js >= 24
- Автоопределение по экстракторам; самый новый формат: SBER_DEBIT_2603

Поддерживаемые экстракторы
- SBER_DEBIT_2603 (дебетовая карта, макет марта 2026)

Выходные форматы
- JSON и CSV (без Excel)
- Проверка баланса и опциональный обратный порядок

Запуск
- `npx tsx src/cli.ts <file.pdf>`
- `pnpm exec tsx src/cli.ts <file.pdf>`

Тесты и качество
- Vitest + coverage (`pnpm test`, `pnpm run test:coverage`)
- Biome (`pnpm run lint`)

Публикация
- npm пакет: @rvboris/sberparse
- GitHub Actions CI: `.github/workflows/ci.yml`

Публикация
- npm пакет: @rvboris/sberparse
