import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { transactionsToCsv, writeTransactionsToCsv } from "../src/csv-writer.js";
import { transactionsToJson, writeTransactionsToJson } from "../src/json-writer.js";
import type { Transaction } from "../src/types.js";

describe("writers", () => {
  it("writes CSV with BOM and headers", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "sberparse-"));
    const filename = path.join(dir, "output");

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

    const output = await writeTransactionsToCsv(transactions, filename, columnsInfo);
    const content = await fs.readFile(output, "utf-8");

    expect(content.charCodeAt(0)).toBe(0xfeff);
    expect(content).toContain("Дата операции");
  });

  it("renders CSV in memory", () => {
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

    const content = transactionsToCsv(transactions, columnsInfo);

    expect(content.charCodeAt(0)).toBe(0xfeff);
    expect(content).toContain("Дата операции");
  });

  it("writes JSON with metadata", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "sberparse-"));
    const filename = path.join(dir, "output");

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
    ];

    const output = await writeTransactionsToJson(transactions, filename, "SBER_TEST", "");
    const content = JSON.parse(await fs.readFile(output, "utf-8")) as {
      metadata: { extractor: string };
    };

    expect(content.metadata.extractor).toBe("SBER_TEST");
  });

  it("renders JSON in memory", () => {
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
    ];

    const content = JSON.parse(
      transactionsToJson(transactions, "SBER_TEST", "", { pretty: false }),
    ) as { metadata: { extractor: string } };

    expect(content.metadata.extractor).toBe("SBER_TEST");
  });
});
