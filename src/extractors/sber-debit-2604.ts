import type { Decimal } from "decimal.js";
import { InputFileStructureError } from "../exceptions.js";
import { Extractor } from "../extractor.js";
import type { Transaction } from "../types.js";
import { getDecimalFromMoney } from "../utils.js";

/**
 * Экстрактор для дебетовой выписки Сбербанка образца апреля 2026 (SBER_DEBIT_2604)
 */
export class SBER_DEBIT_2604 extends Extractor {
  static quickCheck(text: string): boolean {
    const isSberStatement =
      /сбербанк/i.test(text) &&
      /Выписка по плат[её]жному сч[её]ту/i.test(text) &&
      (/Расшифровка операций/i.test(text) || /ИТОГО ПО ОПЕРАЦИЯМ/i.test(text));
    const hasAprilOperationLine =
      /^\d{2}\.\d{2}\.\d{4}\s*\d{2}:\d{2}\s+[^\d\s].*?[+-]?\d[\d\s\u00a0]*,\d{2}\s+\d[\d\s\u00a0]*,\d{2}/m.test(
        text,
      );
    const hasAprilProcessingLine = /^\d{2}\.\d{2}\.\d{4}\s+\d{3,8}\s+/m.test(text);

    return (
      isSberStatement && hasAprilOperationLine && hasAprilProcessingLine
    );
  }

  checkSpecificSignatures(): void {
    const testSberbank = /сбербанк/i.test(this.bank_text) || /sberbank/i.test(this.bank_text);
    const testVipiska = /Выписка по плат[её]жному сч[её]ту/i.test(this.bank_text);
    const testPodlinnost = /Для проверки подлинности документа/i.test(this.bank_text);
    const testOperationLine =
      /^\d{2}\.\d{2}\.\d{4}\s*\d{2}:\d{2}\s*[^\d\s].*?[+-]?\d[\d\s\u00a0]*,\d{2}\s+\d[\d\s\u00a0]*,\d{2}/m.test(
        this.bank_text,
      );

    if (!(testSberbank && testVipiska && testPodlinnost && testOperationLine)) {
      throw new InputFileStructureError("Не найдены паттерны, соответствующие выписке");
    }
  }

  getPeriodBalance(): Decimal {
    const topUpMatch = this.bank_text.match(/Пополнение\s*([\d\s\u00a0]+,\d{2})/);
    const debitMatch = this.bank_text.match(/Списание\s*([\d\s\u00a0]+,\d{2})/);

    if (!topUpMatch || !debitMatch) {
      throw new InputFileStructureError("Не найдена структура с остатками и пополнениями");
    }

    const summaPopolneniy = getDecimalFromMoney(topUpMatch[1]);
    const summaSpisaniy = getDecimalFromMoney(debitMatch[1]);

    return summaPopolneniy.minus(summaSpisaniy);
  }

  splitTextOnEntries(): string[] {
    const headerIndex = this.bank_text.search(/Расшифровка операций/i);
    if (headerIndex === -1) {
      throw new InputFileStructureError(
        "Не обнаружена ожидаемая структура данных: не найден блок операций",
      );
    }

    const tailSlice = this.bank_text.slice(headerIndex);
    const tailIndex = tailSlice.search(/\nДата формирования/i);
    const relevantText = tailIndex === -1 ? tailSlice : tailSlice.slice(0, tailIndex);

    const opLineRegex = /^\d{2}\.\d{2}\.\d{4}\s*\d{2}:\d{2}\s*[^\d\s]/;
    const skipLineRegex = /^(Продолжение на следующей странице|Выписка по плат[её]жному сч[её]туСтраница|ДАТА ОПЕРАЦИИ|Дата обработки|КАТЕГОРИЯ$|Описание операции$|СУММА В ВАЛЮТЕ СЧЁТА|Сумма в валюте|ОСТАТОК СРЕДСТВ|В ВАЛЮТЕ СЧЁТА)/i;
    const stopLineRegex = /^(Дата формирования|ПАО Сбербанк|Проверить подпись|Скачать электронный формат подписи|Согласно статье|Денежные средства списываются|\*)$/i;

    const entries: string[] = [];
    let current: string[] = [];
    let started = false;

    let startIndex = 0;
    while (startIndex <= relevantText.length) {
      const endIndex = relevantText.indexOf("\n", startIndex);
      const rawLine = endIndex === -1
        ? relevantText.slice(startIndex)
        : relevantText.slice(startIndex, endIndex);
      startIndex = endIndex === -1 ? relevantText.length + 1 : endIndex + 1;

      const line = rawLine.trim();
      if (!line || skipLineRegex.test(line)) {
        continue;
      }

      if (opLineRegex.test(line)) {
        started = true;
        if (current.length > 0) {
          entries.push(current.join("\n"));
        }
        current = [line];
        continue;
      }

      if (started && stopLineRegex.test(line)) {
        if (current.length > 0) {
          entries.push(current.join("\n"));
          current = [];
        }
        break;
      }

      if (current.length > 0) {
        current.push(line);
      }
    }

    if (current.length > 0) {
      entries.push(current.join("\n"));
    }

    if (entries.length === 0) {
      throw new InputFileStructureError(
        "Не обнаружена ожидаемая структура данных: не найдено ни одной транзакции",
      );
    }

    return entries;
  }

  decomposeEntryToDict(entry: string): Transaction {
    const lines = entry
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      throw new InputFileStructureError(`entry is expected to have at least 2 lines\n${entry}`);
    }

    const firstLine = lines[0];
    const moneyRegex = /[+-]?\d[\d\s\u00a0]*,\d{2}/g;
    let match: RegExpExecArray | null;
    let lastMatch: RegExpExecArray | null = null;
    let prevMatch: RegExpExecArray | null = null;

    while ((match = moneyRegex.exec(firstLine)) !== null) {
      prevMatch = lastMatch;
      lastMatch = match;
    }

    if (!prevMatch || !lastMatch || prevMatch.index === undefined || lastMatch.index === undefined) {
      throw new InputFileStructureError(`Не удалось найти суммы в строке операции\n${firstLine}`);
    }

    const amountStr = prevMatch[0];
    const remainderStr = lastMatch[0];
    const opHeader = (
      firstLine.slice(0, prevMatch.index) +
      firstLine.slice(prevMatch.index + amountStr.length, lastMatch.index) +
      firstLine.slice(lastMatch.index + remainderStr.length)
    ).trim();
    const opHeaderMatch = opHeader.match(/^(\d{2}\.\d{2}\.\d{4})\s*(\d{2}:\d{2})(.*)$/);

    if (!opHeaderMatch) {
      throw new InputFileStructureError(`Не удалось разобрать строку операции\n${firstLine}`);
    }

    const operationDate = new Date(
      parseInt(opHeaderMatch[1].split(".")[2], 10),
      parseInt(opHeaderMatch[1].split(".")[1], 10) - 1,
      parseInt(opHeaderMatch[1].split(".")[0], 10),
      parseInt(opHeaderMatch[2].split(":")[0], 10),
      parseInt(opHeaderMatch[2].split(":")[1], 10),
    );

    const category = opHeaderMatch[3].trim();
    if (!category) {
      throw new InputFileStructureError(`Не удалось определить категорию операции\n${firstLine}`);
    }

    const processingLine = lines[1];
    const processingMatch = processingLine.match(/^(\d{2}\.\d{2}\.\d{4})\s*(\d{3,8})(.*)$/);
    if (!processingMatch) {
      throw new InputFileStructureError(`Не удалось разобрать строку обработки\n${processingLine}`);
    }

    const descriptionParts: string[] = [];
    if (processingMatch[3].trim()) {
      descriptionParts.push(processingMatch[3].trim());
    }

    for (const line of lines.slice(2)) {
      if (line.trim()) {
        descriptionParts.push(line.trim());
      }
    }

    return {
      operation_date: operationDate,
      processing_date: new Date(
        parseInt(processingMatch[1].split(".")[2], 10),
        parseInt(processingMatch[1].split(".")[1], 10) - 1,
        parseInt(processingMatch[1].split(".")[0], 10),
      ),
      authorisation_code: processingMatch[2],
      description: descriptionParts.join(" ").trim(),
      category,
      value_account_currency: getDecimalFromMoney(amountStr, true).toNumber(),
      remainder_account_currency: getDecimalFromMoney(remainderStr, false).toNumber(),
    };
  }

  getColumnNameForBalanceCalculation(): string {
    return "value_account_currency";
  }

  getColumnsInfo(): Record<string, string> {
    return {
      operation_date: "Дата операции",
      processing_date: "Дата обработки",
      authorisation_code: "Код авторизации",
      description: "Описание операции",
      category: "Категория",
      value_account_currency: "Сумма в валюте счёта",
      value_operational_currency: "Сумма в валюте операции",
      operational_currency: "Валюта операции",
      remainder_account_currency: "Остаток средств в валюте счёта",
    };
  }
}
