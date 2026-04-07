import { describe, expect, it } from "vitest";
import { getDecimalFromMoney, splitSberbankLine } from "../src/utils.js";

describe("utils", () => {
  it("parses money and applies sign rules", () => {
    const negative = getDecimalFromMoney("1 234,50", true).toNumber();
    const positive = getDecimalFromMoney("+1 234,50", true).toNumber();

    expect(negative).toBe(-1234.5);
    expect(positive).toBe(1234.5);
  });

  it("splits Sberbank tab-delimited lines", () => {
    const parts = splitSberbankLine("a\tb\t\tc");
    expect(parts).toEqual(["a", "b", "c"]);
  });
});
