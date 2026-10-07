import type { Cents } from "./money.js";

/** A product with its unique code and undiscounted price in cents. */
export interface Product {
  readonly code: string;
  readonly name: string;
  readonly price: Cents;
}

export class UnknownProductError extends Error {
  constructor(readonly code: string) {
    super(`Unknown product code: ${code}`);
    this.name = "UnknownProductError";
  }
}

export class Catalogue {
  private readonly productsByCode = new Map<string, Product>();
  private readonly products: readonly Product[];

  constructor(products: readonly Product[]) {
    for (const product of products) {
      if (this.productsByCode.has(product.code)) {
        throw new Error(`Duplicate product code: ${product.code}`);
      }
      if (!Number.isSafeInteger(product.price) || product.price < 0) {
        throw new Error(`Price for ${product.code} must be a non-negative safe integer`);
      }
      this.productsByCode.set(product.code, Object.freeze({ ...product }));
    }
    this.products = Object.freeze([...this.productsByCode.values()]);
  }

  get(code: string): Product {
    const product = this.productsByCode.get(code);
    if (!product) throw new UnknownProductError(code);
    return product;
  }

  list(): readonly Product[] {
    return this.products;
  }
}
