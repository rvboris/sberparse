import { describe, expect, it } from "vitest";
import { unidecode } from "../src/unidecode.js";

describe("unidecode", () => {
  it("transliterates Cyrillic and currency symbols", () => {
    expect(unidecode("Привет ₽")).toBe("Privet RUB");
    expect(unidecode("€")).toBe("EUR");
  });
});
