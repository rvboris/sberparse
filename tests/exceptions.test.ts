import { describe, expect, it } from "vitest";
import {
  BalanceVerificationError,
  InputFileStructureError,
  SberParseError,
  UserInputError,
} from "../src/exceptions.js";

describe("exceptions", () => {
  it("extends base error", () => {
    const err = new InputFileStructureError("test");
    expect(err).toBeInstanceOf(SberParseError);
  });

  it("sets error names", () => {
    expect(new BalanceVerificationError("x").name).toBe("BalanceVerificationError");
    expect(new UserInputError("x").name).toBe("UserInputError");
  });
});
