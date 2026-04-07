# sberparse

Конвертация выписок Сбербанка из PDF в JSON/CSV формат.

## Установка

> Package note: requires Node.js 24+.

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
 sberparse ./vypiska.pdf -f SBER_DEBIT_2603

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

- SBER_DEBIT_2603 - Дебетовая карта образца марта 2026

## Лицензия

MIT
