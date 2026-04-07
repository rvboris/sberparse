import path from "node:path";
import { describe, expect, it } from "vitest";
import { pdfToText } from "../src/pdf-parser.js";

describe("pdf-parser", () => {
  it("extracts text from sample pdf", async () => {
    const filePath = path.join(process.cwd(), "samples", "example-debit-01-03-2026.pdf");
    const text = await pdfToText(filePath);
    expect(text).toContain("Выписка по платёжному счёту");
  });
});
