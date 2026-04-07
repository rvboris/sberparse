import { Decimal } from "decimal.js";
import { describe, expect, it } from "vitest";
import { checkTransactionsBalance } from "../src/balance-checker.js";
import { BalanceVerificationError } from "../src/exceptions.js";
import type { Transaction } from "../src/types.js";

describe("balance-checker", () => {
  it("accepts correct balance", () => {
    const transactions: Transaction[] = [
      {
        operation_date: new Date("2026-03-14T10:00:00Z"),
        processing_date: new Date("2026-03-14T10:00:00Z"),
        authorisation_code: "123",
        description: "Test",
        category: "Test",
        value_account_currency: 10,
        remainder_account_currency: 0,
      },
      {
        operation_date: new Date("2026-03-14T10:01:00Z"),
        processing_date: new Date("2026-03-14T10:01:00Z"),
        authorisation_code: "124",
        description: "Test",
        category: "Test",
        value_account_currency: -5,
        remainder_account_currency: 0,
      },
    ];

    expect(() => {
      checkTransactionsBalance(transactions, new Decimal(5), "value_account_currency");
    }).not.toThrow();
  });

  it("throws on balance mismatch", () => {
    const transactions: Transaction[] = [
      {
        operation_date: new Date("2026-03-14T10:00:00Z"),
        processing_date: new Date("2026-03-14T10:00:00Z"),
        authorisation_code: "123",
        description: "Test",
        category: "Test",
        value_account_currency: 10,
        remainder_account_currency: 0,
      },
    ];

    expect(() => {
      checkTransactionsBalance(transactions, new Decimal(5), "value_account_currency");
    }).toThrow(BalanceVerificationError);
  });
});
