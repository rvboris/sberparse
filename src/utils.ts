import { Decimal } from "decimal.js";
import { unidecode } from "./unidecode.js";

/**
 * Конвертирует строку с деньгами в Decimal
 * @param money_str Строка с суммой (например, "1 189,40")
 * @param process_no_sign_as_negative Если true, число без знака считается отрицательным
 * @returns Decimal значение
 */
export function getDecimalFromMoney(
  money_str: string,
  process_no_sign_as_negative = false,
): Decimal {
  // Транслитерация
  let cleaned = unidecode(money_str);

  // Удаляем пробелы
  cleaned = cleaned.replace(/\s/g, "");

  // Заменяем запятую на точку
  cleaned = cleaned.replace(",", ".");

  const has_plus = cleaned.startsWith("+");

  const decimal = new Decimal(cleaned);

  if (process_no_sign_as_negative && !has_plus) {
    return decimal.negated();
  }

  return decimal;
}

/**
 * Разделяет строку Сбербанка на части по табуляции
 * @param line Строка с табуляциями
 * @returns Массив частей без пустых элементов
 */
export function splitSberbankLine(line: string): string[] {
  return line
    .split("\t")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/**
 * Преобразует Decimal в number для JSON/CSV
 * @param value Значение
 * @returns number или исходное значение
 */
export function decimalToNumber(value: unknown): number | unknown {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  return value;
}

/**
 * Конвертирует все Decimal в объекте транзакции в number
 * @param transaction Транзакция
 * @returns Транзакция с number вместо Decimal
 */
export function convertDecimalsInTransaction(
  transaction: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(transaction)) {
    if (value instanceof Date) {
      result[key] = value;
    } else if (value instanceof Decimal) {
      result[key] = value.toNumber();
    } else {
      result[key] = value;
    }
  }

  return result;
}
