import { describe, expect, it } from "vitest";
import { SecondItemPercentageDiscount } from "./second-item-percentage-discount.js";

const red = { code: "R01", name: "Red Widget", price: 3295 };
const blue = { code: "B01", name: "Blue Widget", price: 795 };
const options = {
  productCode: "R01",
  percentOff: 50,
  description: "Red Widget: second one half price",
};

describe("SecondItemPercentageDiscount", () => {
  it.each([0, 1])("does not apply to %i matching items", (count) => {
    const offer = new SecondItemPercentageDiscount(options);
    expect(offer.apply(Array.from({ length: count }, () => red))).toBeNull();
  });

  it.each([
    [2, 1648],
    [3, 1648],
    [4, 3296],
  ])("discounts %i matching items by %i cents", (count, expected) => {
    const offer = new SecondItemPercentageDiscount(options);
    expect(offer.apply(Array.from({ length: count }, () => red))).toEqual({
      description: options.description,
      amount: expected,
    });
  });

  it("ignores other products and can be reused across baskets", () => {
    const offer = new SecondItemPercentageDiscount(options);
    expect(offer.apply([red, blue, red, blue])?.amount).toBe(1648);
    expect(offer.apply([blue, blue, red])).toBeNull();
  });

  it("can configure a different product and percentage", () => {
    const offer = new SecondItemPercentageDiscount({
      productCode: "B01",
      percentOff: 25,
      description: "Blue savings",
    });
    expect(offer.apply([blue, red, blue])).toEqual({ description: "Blue savings", amount: 199 });
  });

  it.each([-1, 101, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid percentage %s",
    (value) => {
      expect(() => new SecondItemPercentageDiscount({ ...options, percentOff: value })).toThrow(
        "between 0 and 100",
      );
    },
  );
});
