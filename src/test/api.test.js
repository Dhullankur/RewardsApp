import { describe, expect, it } from "vitest";
import { centsToDollars } from "../api";

describe("centsToDollars", () => {
  it("converts integer cents to dollars", () => {
    expect(centsToDollars(8000)).toBe(80);
    expect(centsToDollars(4599)).toBe(45.99);
    expect(centsToDollars(10020)).toBe(100.2);
  });

  it("throws for invalid cents", () => {
    expect(() => centsToDollars(undefined)).toThrow(/Invalid price/);
    expect(() => centsToDollars("abc")).toThrow(/Invalid price/);
    expect(() => centsToDollars(45.99)).toThrow(/Invalid price/);
    expect(() => centsToDollars(-100)).toThrow(/Invalid price/);
  });
});
