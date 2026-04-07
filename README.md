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

## Поддерживаемые форматы

- SBER_DEBIT_2603 - Дебетовая карта образца марта 2026

## Лицензия

MIT
