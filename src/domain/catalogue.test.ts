import { describe, expect, it } from "vitest";
import { Catalogue, UnknownProductError } from "./catalogue.js";

const red = { code: "R01", name: "Red Widget", price: 3295 };

describe("Catalogue", () => {
  it("looks products up and lists them in configured order", () => {
    const catalogue = new Catalogue([red]);
    expect(catalogue.get("R01")).toEqual(red);
    expect(catalogue.list()).toEqual([red]);
  });

  it("rejects an unknown code with the code in its error", () => {
    const catalogue = new Catalogue([red]);
    expect(() => catalogue.get("NOPE")).toThrow(UnknownProductError);
    expect(() => catalogue.get("NOPE")).toThrow("Unknown product code: NOPE");
  });

  it("rejects duplicate product codes", () => {
    expect(() => new Catalogue([red, { ...red, price: 100 }])).toThrow("Duplicate product code");
  });

  it.each([-1, 3.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    "rejects an invalid price of %s",
    (price) => {
      expect(() => new Catalogue([{ ...red, price }])).toThrow("non-negative safe integer");
    },
  );

  it("accepts a zero price", () => {
    expect(new Catalogue([{ ...red, price: 0 }]).get("R01").price).toBe(0);
  });

  it("takes a snapshot so changing constructor input cannot change prices", () => {
    const product = { ...red };
    const products = [product];
    const catalogue = new Catalogue(products);
    product.price = 1;
    products.length = 0;
    expect(catalogue.get("R01").price).toBe(3295);
    expect(catalogue.list()).toHaveLength(1);
  });
});
