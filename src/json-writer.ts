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
      version: "1.0.0",
      extractor: extractorName,
      generated_at: new Date().toISOString(),
      errors: errors,
    },
    transactions: serializableTransactions,
  };

  await fs.writeFile(outputFilename, JSON.stringify(output, null, 2), "utf-8");

  return outputFilename;
}
