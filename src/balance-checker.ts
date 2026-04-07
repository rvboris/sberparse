import { Decimal } from "decimal.js";
import { BalanceVerificationError } from "./exceptions.js";
import type { Transaction } from "./types.js";

/**
 * Проверяет баланс транзакций
 * @param transactions Список транзакций
 * @param balance Баланс из шапки выписки
 * @param columnNameForBalance Название колонки для расчёта
 * @throws {BalanceVerificationError} если баланс не совпадает
 */
export function checkTransactionsBalance(
  transactions: Transaction[],
  balance: Decimal,
  columnNameForBalance: string,
): void {
  let calculatedBalance = new Decimal(0);

  for (const transaction of transactions) {
    const value = (transaction as unknown as Record<string, number>)[columnNameForBalance];
    if (typeof value === "number") {
      calculatedBalance = calculatedBalance.plus(value);
    }
  }

  const difference = balance.minus(calculatedBalance).abs();

  if (difference.greaterThan(0.01)) {
    throw new BalanceVerificationError(
      `Ошибка проверки баланса по транзакциям:\n` +
        `  Вычисленный баланс по информации в шапке выписки = ${balance.toFixed(2)}\n` +
        `  Вычисленный баланс по всем транзакциям = ${calculatedBalance.toFixed(2)}\n` +
        `  Разница = ${difference.toFixed(2)}`,
    );
  }
}

/**
 * Переворачивает порядок транзакций
 * @param transactions Список транзакций
 * @returns Перевёрнутый список
 */
export function reverseTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].reverse();
}
