import { describe, expect, it } from "vitest";
import { percentOff } from "./money.js";

describe("percentOff", () => {
  it("rounds fractional-cent discounts in the customer's favour", () => {
    expect(percentOff(3295, 50)).toBe(1648);
  });

  it.each([
    [0, 50, 0],
    [1000, 0, 0],
    [1000, 25, 250],
    [3295, 100, 3295],
  ])("discounts %i cents by %i percent to give %i cents off", (amount, percent, expected) => {
    expect(percentOff(amount, percent)).toBe(expected);
  });
});
