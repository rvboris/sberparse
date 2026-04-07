import fs from "node:fs/promises";
import path from "node:path";
import { checkTransactionsBalance, reverseTransactions } from "./balance-checker.js";
import { writeTransactionsToCsv } from "./csv-writer.js";
import { BalanceVerificationError, UserInputError } from "./exceptions.js";
import { determineExtractorAuto, determineExtractorByName } from "./extractor-selector.js";
import { writeTransactionsToJson } from "./json-writer.js";
import { logger } from "./logger.js";
import { pdfToText } from "./pdf-parser.js";
import type { CLIOptions, ExtractorResult } from "./types.js";

/**
 * Конвертирует PDF файл в JSON/CSV
 * @param inputFileName Путь к входному PDF файлу
 * @param options Опции CLI
 * @returns Информация о результате
 */
export async function convertPdf(
  inputFileName: string,
  options: CLIOptions,
): Promise<ExtractorResult> {
  logger.info`${"*".repeat(30)}`;
  logger.info`Конвертируем файл ${inputFileName}`;

  // Проверяем расширение
  const ext = path.extname(inputFileName).toLowerCase();
  if (ext !== ".pdf") {
    throw new UserInputError(`Неподдерживаемое расширение файла: ${ext}`);
  }

  // Конвертируем PDF в текст
  const bankText = await pdfToText(inputFileName);

  // Сохраняем промежуточный файл, если запрошено
  if (options.interm) {
    const txtFileName = inputFileName.replace(/\.pdf$/i, ".txt");
    await fs.writeFile(txtFileName, bankText, "utf-8");
    logger.info`Сохранён промежуточный файл: ${txtFileName}`;
  }

  // Определяем экстрактор
  let extractorClass: ReturnType<typeof determineExtractorAuto>;
  if (options.format) {
    extractorClass = determineExtractorByName(options.format);
    logger.info`Конвертируем файл как формат ${options.format}`;
  } else {
    extractorClass = determineExtractorAuto(bankText);
    logger.info`Формат файла определён как ${extractorClass.name}`;
  }

  // Создаём экземпляр экстрактора
  const extractor = new extractorClass(bankText);

  // Получаем транзакции
  const transactions = extractor.getEntries();
  logger.info`Найдено транзакций: ${transactions.length}`;

  // Получаем баланс из шапки
  const periodBalance = extractor.getPeriodBalance();

  // Получаем информацию о колонках
  const columnsInfo = extractor.getColumnsInfo();

  // Проверяем баланс
  let error = "";
  try {
    checkTransactionsBalance(
      transactions,
      periodBalance,
      extractor.getColumnNameForBalanceCalculation(),
    );
  } catch (e) {
    if (e instanceof BalanceVerificationError) {
      if (options.balance_check) {
        throw e;
      } else {
        logger.warn`${e.message}`;
        error = e.message;
      }
    } else {
      throw e;
    }
  }

  // Переворачиваем порядок, если запрошено
  let finalTransactions = transactions;
  if (options.reverse) {
    finalTransactions = reverseTransactions(transactions);
  }

  // Определяем выходной файл
  let outputFileName: string;
  if (options.output) {
    outputFileName = options.output;
  } else {
    outputFileName = inputFileName.replace(/\.pdf$/i, "");
  }

  // Записываем результат
  if (options.type === "json") {
    const filename = await writeTransactionsToJson(
      finalTransactions,
      outputFileName,
      extractorClass.name,
      error,
    );
    logger.info`Создан файл ${filename}`;
  } else {
    const filename = await writeTransactionsToCsv(finalTransactions, outputFileName, columnsInfo);
    logger.info`Создан файл ${filename}`;
  }

  return {
    extractor_name: extractorClass.name,
    transactions: finalTransactions,
    period_balance: periodBalance.toNumber(),
    balance_column: extractor.getColumnNameForBalanceCalculation(),
    columns_info: columnsInfo,
    errors: error,
  };
}
