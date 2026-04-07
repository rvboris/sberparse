import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { InputFileStructureError, UserInputError } from "../src/exceptions.js";
import { determineExtractorAuto, determineExtractorByName } from "../src/extractor-selector.js";
import { SBER_DEBIT_2603 } from "../src/extractors/sber-debit-2603.js";

const fixturesDir = path.join(process.cwd(), "tests", "fixtures");

describe("extractor-selector", () => {
  it("selects extractor by name", () => {
    expect(determineExtractorByName("SBER_DEBIT_2603")).toBe(SBER_DEBIT_2603);
  });

  it("throws for unknown extractor name", () => {
    expect(() => determineExtractorByName("UNKNOWN")).toThrow(UserInputError);
  });

  it("auto-detects payment account extractor", async () => {
    const text = await fs.readFile(path.join(fixturesDir, "payment-2603.txt"), "utf-8");
    const extractor = determineExtractorAuto(text);
    expect(extractor).toBe(SBER_DEBIT_2603);
  });

  it("throws when no extractor matches", () => {
    expect(() => determineExtractorAuto("invalid text")).toThrow(InputFileStructureError);
  });
});
