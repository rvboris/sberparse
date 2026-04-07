import { describe, expect, it } from "vitest";
import type { Transaction } from "../src/types.js";

describe("types", () => {
  it("supports Transaction shape", () => {
    const tx: Transaction = {
      operation_date: new Date("2026-03-14T10:00:00Z"),
      processing_date: new Date("2026-03-14T10:00:00Z"),
      authorisation_code: "123",
      description: "Test",
      category: "Test",
      value_account_currency: 1,
      remainder_account_currency: 1,
      value_operational_currency: 1,
      operational_currency: "RUB",
    };

    expect(tx.value_account_currency).toBe(1);
  });
});
