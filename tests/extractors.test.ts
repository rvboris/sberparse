import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkTransactionsBalance } from "../src/balance-checker.js";
import { BalanceVerificationError } from "../src/exceptions.js";
import { SBER_DEBIT_2603 } from "../src/extractors/sber-debit-2603.js";

const fixturesDir = path.join(process.cwd(), "tests", "fixtures");

describe("extractors", () => {
  it("parses payment account (SBER_DEBIT_2603)", async () => {
    const text = await fs.readFile(path.join(fixturesDir, "payment-2603.txt"), "utf-8");
    const extractor = new SBER_DEBIT_2603(text);

    expect(extractor.checkSupport()).toBe(true);

    const entries = extractor.getEntries();
    expect(entries.length).toBe(2);
    expect(entries[0].category).toBe("Прочие операции");
    expect(entries[0].value_account_currency).toBe(10000);
    expect(entries[0].description).toContain("****1234");
    expect(entries[1].description).toContain("****5678");
    expect(entries[entries.length - 1].description).not.toMatch(
      /ПАО Сбербанк|Дата формирования|Генеральная лицензия/,
    );
  });

  it("throws when balance does not match", async () => {
    const text = await fs.readFile(path.join(fixturesDir, "payment-2603-bad-balance.txt"), "utf-8");
    const extractor = new SBER_DEBIT_2603(text);
    const entries = extractor.getEntries();

    expect(() => {
      checkTransactionsBalance(
        entries,
        extractor.getPeriodBalance(),
        extractor.getColumnNameForBalanceCalculation(),
      );
    }).toThrow(BalanceVerificationError);
  });
});
