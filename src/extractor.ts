import { Decimal } from "decimal.js";
import { InputFileStructureError, SberParseError } from "./exceptions.js";
import type { Transaction } from "./types.js";

/**
 * Абстрактный базовый класс для всех экстракторов
 * Все конкретные экстракторы должны наследоваться от этого класса
 * и переопределять все абстрактные методы
 */
export abstract class Extractor {
  /** Текст выписки */
  protected bank_text: string;

  constructor(bank_text: string) {
    this.bank_text = bank_text;
  }

  /**
   * Проверяет специфичные сигнатуры формата выписки
   * @throws {InputFileStructureError} если текст не соответствует формату
   */
  abstract checkSpecificSignatures(): void;

  /**
   * Получает баланс периода из шапки выписки
   * @returns Баланс периода
   * @throws {InputFileStructureError} если не удалось найти баланс
   */
  abstract getPeriodBalance(): Decimal;

  /**
   * Разделяет текст на отдельные записи (транзакции)
   * @returns Массив текстовых записей
   * @throws {InputFileStructureError} если не найдено транзакций
   */
  abstract splitTextOnEntries(): string[];

  /**
   * Разбирает одну запись в объект транзакции
   * @param entry Текст записи
   * @returns Объект транзакции или массив объектов
   * @throws {InputFileStructureError} если не удалось разобрать запись
   */
  abstract decomposeEntryToDict(entry: string): Transaction | Transaction[];

  /**
   * Возвращает название колонки для расчёта баланса
   * @returns Название колонки
   */
  abstract getColumnNameForBalanceCalculation(): string;

  /**
   * Возвращает информацию о колонках
   * @returns Словарь: ключ поля → название колонки
   */
  abstract getColumnsInfo(): Record<string, string>;

  /**
   * Проверяет, поддерживается ли данный текст экстрактором
   * @returns true если поддерживается
   */
  checkSupport(): boolean {
    try {
      // Проверка сигнатур
      this.checkSpecificSignatures();

      // Проверка что баланс получен
      const balance = this.getPeriodBalance();
      if (!(balance instanceof Decimal)) {
        return false;
      }

      // Проверка что есть транзакции
      const entries = this.splitTextOnEntries();
      if (entries.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof InputFileStructureError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Получает список всех транзакций из выписки
   * @returns Массив объектов транзакций
   * @throws {SberParseError} если произошла ошибка при обработке
   */
  getEntries(): Transaction[] {
    const entries_list: Transaction[] = [];

    for (const entry of this.splitTextOnEntries()) {
      try {
        const result = this.decomposeEntryToDict(entry);
        if (Array.isArray(result)) {
          entries_list.push(...result);
        } else {
          entries_list.push(result);
        }
      } catch (_error) {
        throw new SberParseError(
          `Ошибка при обработке транзакции\n${"-".repeat(20)}\n${entry}\n${"-".repeat(20)}`,
        );
      }
    }

    return entries_list;
  }
}
