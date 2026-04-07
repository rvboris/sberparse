import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { writeTransactionsToCsv } from "../src/csv-writer.js";
import { writeTransactionsToJson } from "../src/json-writer.js";
import type { Transaction } from "../src/types.js";

describe("csv/json integration", () => {
  it("writes consistent transaction counts", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "sberparse-"));
    const base = path.join(dir, "output");

    const transactions: Transaction[] = [
      {
        operation_date: new Date("2026-03-14T10:00:00Z"),
        processing_date: new Date("2026-03-14T10:00:00Z"),
        authorisation_code: "123",
        description: "Test",
        category: "Test",
        value_account_currency: 10,
        remainder_account_currency: 5,
      },
      {
        operation_date: new Date("2026-03-14T10:01:00Z"),
        processing_date: new Date("2026-03-14T10:01:00Z"),
        authorisation_code: "124",
        description: "Test2",
        category: "Test",
        value_account_currency: -5,
        remainder_account_currency: 0,
      },
    ];

    const columnsInfo = {
      operation_date: "Дата операции",
      processing_date: "Дата обработки",
      authorisation_code: "Код авторизации",
      description: "Описание операции",
      category: "Категория",
      value_account_currency: "Сумма в валюте счёта",
      remainder_account_currency: "Остаток средств в валюте счёта",
    };

    const csvPath = await writeTransactionsToCsv(transactions, base, columnsInfo);
    const jsonPath = await writeTransactionsToJson(transactions, base, "SBER_TEST", "");

    const csvContent = await fs.readFile(csvPath, "utf-8");
    const jsonContent = JSON.parse(await fs.readFile(jsonPath, "utf-8")) as {
      transactions: unknown[];
    };

    const csvLines = csvContent.trim().split("\n");
    expect(csvLines.length - 1).toBe(jsonContent.transactions.length);
  });
});
