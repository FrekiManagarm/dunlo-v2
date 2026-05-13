import { describe, expect, it } from "vitest";
import { formatAmount, humanizeFailureCode, renderTemplate } from "./template";

describe("renderTemplate", () => {
  it("replaces simple variables", () => {
    expect(renderTemplate("Hello {{name}}", { name: "Mat" })).toBe("Hello Mat");
  });

  it("handles whitespace inside braces", () => {
    expect(renderTemplate("Hi {{ name }}!", { name: "Mat" })).toBe("Hi Mat!");
  });

  it("replaces multiple occurrences of the same variable", () => {
    expect(renderTemplate("{{a}} and {{a}}", { a: "x" })).toBe("x and x");
  });

  it("substitutes missing variables with empty string", () => {
    expect(renderTemplate("Hello {{name}}!", {})).toBe("Hello !");
  });

  it("substitutes undefined variables with empty string", () => {
    expect(renderTemplate("Hello {{name}}!", { name: undefined })).toBe("Hello !");
  });

  it("leaves text without placeholders unchanged", () => {
    expect(renderTemplate("plain text", { x: "y" })).toBe("plain text");
  });
});

describe("formatAmount", () => {
  it("formats EUR amounts", () => {
    expect(formatAmount(8900, "eur")).toMatch(/89[.,]00/);
    expect(formatAmount(8900, "eur")).toMatch(/€/);
  });

  it("formats USD amounts", () => {
    expect(formatAmount(12345, "usd")).toMatch(/123[.,]45/);
    expect(formatAmount(12345, "usd")).toMatch(/\$/);
  });

  it("handles zero", () => {
    expect(formatAmount(0, "eur")).toMatch(/0[.,]00/);
  });
});

describe("humanizeFailureCode", () => {
  it("maps known codes", () => {
    expect(humanizeFailureCode("expired_card")).toBe("Card expired");
    expect(humanizeFailureCode("card_declined")).toBe("Card declined");
    expect(humanizeFailureCode("insufficient_funds")).toBe("Insufficient funds");
    expect(humanizeFailureCode("do_not_honor")).toBe("Bank declined the payment");
  });

  it("falls back to Title Case for unknown codes", () => {
    expect(humanizeFailureCode("some_weird_code")).toBe("Some Weird Code");
    expect(humanizeFailureCode("foo")).toBe("Foo");
  });

  it("handles empty string", () => {
    expect(humanizeFailureCode("")).toBe("");
  });
});
