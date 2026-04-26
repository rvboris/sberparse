import { describe, expect, it } from "vitest";
import { extractorsList } from "../src/extractors/index.js";

describe("cli config", () => {
  it("lists all available formats", () => {
    const names = extractorsList.map((e) => e.name);
    expect(names).toContain("SBER_DEBIT_2604");
    expect(names).toContain("SBER_DEBIT_2603");
  });
});
