/**
 * Transaction - представление одной транзакции из выписки
 */
export interface Transaction {
  /** Дата и время операции */
  operation_date: Date;
  /** Дата обработки */
  processing_date: Date;
  /** Код авторизации */
  authorisation_code: string;
  /** Описание операции */
  description: string;
  /** Категория */
  category: string;
  /** Сумма в валюте счёта */
  value_account_currency: number;
  /** Остаток по счёту в валюте счёта */
  remainder_account_currency: number;
  /** Сумма в валюте операции (опционально) */
  value_operational_currency?: number;
  /** Валюта операции (опционально) */
  operational_currency?: string;
}

/**
 * Результат работы экстрактора
 */
export interface ExtractorResult {
  /** Название использованного экстрактора */
  extractor_name: string;
  /** Список транзакций */
  transactions: Transaction[];
  /** Баланс периода из шапки выписки */
  period_balance: number;
  /** Название колонки для расчёта баланса */
  balance_column: string;
  /** Информация о колонках */
  columns_info: Record<string, string>;
  /** Ошибки при конвертации */
  errors: string;
}

/**
 * Опции CLI
 */
export interface CLIOptions {
  /** Выходной файл (без расширения) */
  output?: string;
  /** Тип выходного файла */
  type: "json" | "csv";
  /** Принудительный формат */
  format?: string;
  /** Обратный порядок транзакций */
  reverse: boolean;
  /** Проверять баланс */
  balance_check: boolean;
  /** Сохранять промежуточный текстовый файл */
  interm: boolean;
}
