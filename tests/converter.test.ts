import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { convertPdf, parsePdf } from "../src/converter.js";
import type { CLIOptions } from "../src/types.js";

vi.mock("../src/pdf-parser.js", async () => {
  const actual =
    await vi.importActual<typeof import("../src/pdf-parser.js")>("../src/pdf-parser.js");
  const fixturesDir = path.join(process.cwd(), "tests", "fixtures");
  const text = await fs.readFile(path.join(fixturesDir, "payment-2603.txt"), "utf-8");
  return {
    ...actual,
    pdfToText: async () => text,
  };
});

describe("converter", () => {
  it("converts PDF to JSON via mocked pdfToText", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "sberparse-"));
    const outputPath = path.join(dir, "result");

    const options: CLIOptions = {
      output: outputPath,
      format: undefined,
      type: "json",
      reverse: false,
      balance_check: true,
      interm: false,
    };

    const result = await convertPdf("fake.pdf", options);
    const outputFile = `${outputPath}.json`;

    const content = await fs.readFile(outputFile, "utf-8");
    expect(JSON.parse(content)).toHaveProperty("metadata");
    expect(result.extractor_name).toBe("SBER_DEBIT_2603");
  });

  it("parses PDF without writing files", async () => {
    const result = await parsePdf("fake.pdf", { balance_check: true });

    expect(result.extractor_name).toBe("SBER_DEBIT_2603");
    expect(result.transactions.length).toBeGreaterThan(0);
  });
});
