import { describe, expect, it } from "vitest";
import { acmePricing } from "./acme-config.js";
import { Basket } from "./basket.js";
import { Catalogue, UnknownProductError } from "./catalogue.js";
import type { DeliveryRule } from "./delivery-rule.js";
import type { Offer } from "./offer.js";

describe("Basket", () => {
  it.each([
    [["B01", "G01"], 3785],
    [["R01", "R01"], 5437],
    [["R01", "G01"], 6085],
    [["B01", "B01", "R01", "R01", "R01"], 9827],
  ])("prices the brief's basket %j at %i cents", (codes, total) => {
    const basket = new Basket(acmePricing);
    for (const code of codes) basket.add(code);
    expect(basket.total()).toBe(total);
    expect(basket.total()).toBe(basket.quote().total);
  });

  it("charges delivery after discounts and rounds the red discount up", () => {
    const basket = new Basket(acmePricing);
    basket.add("R01");
    basket.add("R01");
    expect(basket.quote()).toEqual({
      lines: [{ code: "R01", name: "Red Widget", unitPrice: 3295, quantity: 2, lineTotal: 6590 }],
      subtotal: 6590,
      discounts: [{ description: "Red Widget: second one half price", amount: 1648 }],
      delivery: 495,
      total: 5437,
    });
  });

  it("returns a zero quote with no delivery for an empty basket", () => {
    const basket = new Basket(acmePricing);
    expect(basket.quote()).toEqual({
      lines: [],
      subtotal: 0,
      discounts: [],
      delivery: 0,
      total: 0,
    });
    expect(basket.total()).toBe(0);
  });

  it("leaves the basket unchanged when an unknown code is added", () => {
    const basket = new Basket(acmePricing);
    basket.add("B01");
    const before = basket.quote();
    expect(() => basket.add("UNKNOWN")).toThrow(UnknownProductError);
    expect(basket.quote()).toEqual(before);
  });

  it("groups lines in first-added order", () => {
    const basket = new Basket(acmePricing);
    for (const code of ["G01", "B01", "G01", "R01", "B01"]) basket.add(code);
    expect(basket.quote().lines).toEqual([
      { code: "G01", name: "Green Widget", unitPrice: 2495, quantity: 2, lineTotal: 4990 },
      { code: "B01", name: "Blue Widget", unitPrice: 795, quantity: 2, lineTotal: 1590 },
      { code: "R01", name: "Red Widget", unitPrice: 3295, quantity: 1, lineTotal: 3295 },
    ]);
  });

  it("derives a fresh quote without changing previous quotes or other baskets", () => {
    const basket = new Basket(acmePricing);
    basket.add("R01");
    const before = basket.quote();
    expect(basket.quote()).toEqual(before);
    basket.add("R01");
    expect(before.total).toBe(3790);
    expect(before.lines[0]?.quantity).toBe(1);
    expect(basket.total()).toBe(5437);
    expect(new Basket(acmePricing).total()).toBe(0);
  });

  it("uses injected strategies, adds their discounts, and skips inapplicable offers", () => {
    const subtotals: number[] = [];
    const delivery: DeliveryRule = {
      chargeFor: (subtotal) => {
        subtotals.push(subtotal);
        return 123;
      },
    };
    const offer: Offer = {
      apply: (items) => ({ description: "Per-item discount", amount: items.length * 100 }),
    };
    const basket = new Basket({
      catalogue: new Catalogue([{ code: "TEST", name: "Test product", price: 1000 }]),
      delivery,
      offers: [
        offer,
        { apply: () => null },
        { apply: () => ({ description: "Bonus", amount: 50 }) },
      ],
    });
    basket.add("TEST");
    const quote = basket.quote();
    expect(subtotals).toEqual([850]);
    expect(quote.discounts).toEqual([
      { description: "Per-item discount", amount: 100 },
      { description: "Bonus", amount: 50 },
    ]);
    expect(quote.delivery).toBe(123);
    expect(quote.total).toBe(973);
  });

  it("floors the discounted subtotal at zero before calculating delivery", () => {
    const subtotals: number[] = [];
    const basket = new Basket({
      catalogue: acmePricing.catalogue,
      delivery: {
        chargeFor: (subtotal) => {
          subtotals.push(subtotal);
          return 123;
        },
      },
      offers: [{ apply: () => ({ description: "Oversized discount", amount: 10000 }) }],
    });
    basket.add("B01");
    expect(basket.total()).toBe(123);
    expect(subtotals).toEqual([0]);
  });

  it("does not call delivery for an empty basket", () => {
    const basket = new Basket({
      ...acmePricing,
      delivery: {
        chargeFor: () => {
          throw new Error("Nothing to deliver");
        },
      },
    });
    expect(basket.total()).toBe(0);
  });
});
