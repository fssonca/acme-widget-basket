import { describe, expect, it } from "vitest";
import { TieredDelivery } from "./tiered-delivery.js";

describe("TieredDelivery", () => {
  const tiers = [
    { from: 0, charge: 495 },
    { from: 5000, charge: 295 },
    { from: 9000, charge: 0 },
  ];

  it.each([
    [0, 495],
    [4999, 495],
    [5000, 295],
    [8999, 295],
    [9000, 0],
    [15000, 0],
  ])("prices a subtotal of %i cents at %i cents", (subtotal, expected) => {
    expect(new TieredDelivery(tiers).chargeFor(subtotal)).toBe(expected);
  });

  it("requires a tier starting at zero", () => {
    expect(() => new TieredDelivery([])).toThrow("zero");
    expect(() => new TieredDelivery([{ from: 5000, charge: 295 }])).toThrow("zero");
  });

  it("sorts a copy and does not mutate the supplied tiers", () => {
    const input = [
      { from: 9000, charge: 0 },
      { from: 0, charge: 495 },
    ];
    const delivery = new TieredDelivery(input);
    expect(input[0]?.from).toBe(9000);
    const first = input[0];
    if (first) first.charge = 999;
    input.length = 0;
    expect(delivery.chargeFor(9000)).toBe(0);
    expect(delivery.chargeFor(4999)).toBe(495);
  });

  it("rejects ambiguous duplicate thresholds", () => {
    expect(
      () =>
        new TieredDelivery([
          { from: 0, charge: 0 },
          { from: 0, charge: 1 },
        ]),
    ).toThrow("Duplicate delivery threshold");
  });

  it.each([
    { from: -1, charge: 0 },
    { from: 0.5, charge: 0 },
    { from: 0, charge: -1 },
    { from: 0, charge: 1.5 },
  ])("rejects invalid tier money: %o", (tier) => {
    expect(() => new TieredDelivery([{ from: 0, charge: 495 }, tier])).toThrow(
      "non-negative safe integers",
    );
  });
});
