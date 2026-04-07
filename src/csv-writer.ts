import fs from "node:fs/promises";
import type { Transaction } from "./types.js";

/**
 * Экранирует значение для CSV
 * @param value Значение
 * @returns Экранированное значение
 */
function escapeCsvValue(value: string | number | Date | undefined): string {
  if (value === undefined || value === null) {
    return "";
  }

  let strValue: string;
  if (value instanceof Date) {
    strValue = value.toISOString();
  } else {
    strValue = String(value);
  }

  // Экранируем кавычки и оборачиваем в кавычки если нужно
  if (strValue.includes(";") || strValue.includes('"') || strValue.includes("\n")) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }

  return strValue;
}

interface CsvRenderOptions {
  include_bom?: boolean;
  trailing_newline?: boolean;
}

/**
 * Конвертирует транзакции в CSV строку
 * @param transactions Список транзакций
 * @param columnsInfo Информация о колонках
 * @param options Параметры вывода
 * @returns CSV строка
 */
export function transactionsToCsv(
  transactions: Transaction[],
  columnsInfo: Record<string, string>,
  options: CsvRenderOptions = {},
): string {
  const { include_bom = true, trailing_newline = true } = options;

  // Заголовки
  const headers = Object.keys(columnsInfo);
  const headerRow = headers.map((key) => columnsInfo[key]).join(";");

  // Данные
  const dataRows: string[] = [];
  for (const transaction of transactions) {
    const rowValues = headers.map((key) => {
      const value = (transaction as unknown as Record<string, unknown>)[key];
      let formattedValue: string | number | Date | undefined;

      if (value instanceof Date) {
        // Форматируем дату
        if (key === "operation_date") {
          formattedValue = value.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } else {
          formattedValue = value.toLocaleDateString("ru-RU");
        }
      } else {
        formattedValue = value as string | number | undefined;
      }

      return escapeCsvValue(formattedValue);
    });
    dataRows.push(rowValues.join(";"));
  }

  const csvContent = [headerRow, ...dataRows].join("\n");
  const bom = include_bom ? "\uFEFF" : "";
  const suffix = trailing_newline ? "\n" : "";

  return `${bom + csvContent}${suffix}`;
}

/**
 * Записывает транзакции в CSV файл
 * @param transactions Список транзакций
 * @param filename Имя файла (без расширения)
 * @param columnsInfo Информация о колонках
 * @returns Имя созданного файла
 */
export async function writeTransactionsToCsv(
  transactions: Transaction[],
  filename: string,
  columnsInfo: Record<string, string>,
): Promise<string> {
  const outputFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  const csvContent = transactionsToCsv(transactions, columnsInfo);
  await fs.writeFile(outputFilename, csvContent, "utf-8");

  return outputFilename;
}
