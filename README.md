# sberparse

Конвертация выписок Сбербанка из PDF в JSON/CSV формат.

## Установка

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

# Без проверки баланса
 sberparse ./vypiska.pdf -b

# Сохранить промежуточный текстовый файл
 sberparse ./vypiska.pdf --interm
```

## Использование в коде

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

## Поддерживаемые форматы

- SBER_DEBIT_2603 - Дебетовая карта образца марта 2026

## Лицензия

MIT
