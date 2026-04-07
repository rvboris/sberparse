import fs from "node:fs/promises";
import type { Transaction } from "./types.js";

/**
 * Интерфейс для JSON вывода
 */
interface JSONOutput {
  metadata: {
    version: string;
    extractor: string;
    generated_at: string;
    errors: string;
  };
  transactions: Array<Record<string, string | number | Date | undefined>>;
}

interface JsonRenderOptions {
  version?: string;
  generated_at?: string;
  pretty?: boolean;
}

/**
 * Конвертирует транзакции в JSON строку
 * @param transactions Список транзакций
 * @param extractorName Имя экстрактора
 * @param errors Ошибки при конвертации
 * @param options Параметры вывода
 * @returns JSON строка
 */
export function transactionsToJson(
  transactions: Transaction[],
  extractorName: string,
  errors: string,
  options: JsonRenderOptions = {},
): string {
  const { version = "1.0.0", generated_at = new Date().toISOString(), pretty = true } = options;

  // Конвертируем транзакции в сериализуемый формат
  const serializableTransactions = transactions.map((transaction) => {
    const result: Record<string, string | number | Date | undefined> = {};
    for (const [key, value] of Object.entries(transaction)) {
      if (value instanceof Date) {
        // Преобразуем дату в ISO строку
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }
    return result;
  });

  const output: JSONOutput = {
    metadata: {
      version,
      extractor: extractorName,
      generated_at,
      errors: errors,
    },
    transactions: serializableTransactions,
  };

  return JSON.stringify(output, null, pretty ? 2 : 0);
}

/**
 * Записывает транзакции в JSON файл
 * @param transactions Список транзакций
 * @param filename Имя файла (без расширения)
 * @param extractorName Имя экстрактора
 * @param errors Ошибки при конвертации
 * @returns Имя созданного файла
 */
export async function writeTransactionsToJson(
  transactions: Transaction[],
  filename: string,
  extractorName: string,
  errors: string,
): Promise<string> {
  const outputFilename = filename.endsWith(".json") ? filename : `${filename}.json`;
  const jsonContent = transactionsToJson(transactions, extractorName, errors);
  await fs.writeFile(outputFilename, jsonContent, "utf-8");

  return outputFilename;
}
