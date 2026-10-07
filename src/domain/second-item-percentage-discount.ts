import type { Product } from "./catalogue.js";
import { percentOff } from "./money.js";
import type { AppliedDiscount, Offer } from "./offer.js";

/** Every second matching item receives the configured percentage discount. */
export class SecondItemPercentageDiscount implements Offer {
  constructor(
    private readonly options: {
      readonly productCode: string;
      readonly percentOff: number;
      readonly description: string;
    },
  ) {
    if (
      !Number.isFinite(options.percentOff) ||
      options.percentOff < 0 ||
      options.percentOff > 100
    ) {
      throw new Error("Discount percentage must be between 0 and 100");
    }
    this.options = Object.freeze({ ...options });
  }

  apply(items: readonly Product[]): AppliedDiscount | null {
    const matching = items.filter((item) => item.code === this.options.productCode);
    const product = matching[0];
    if (!product || matching.length < 2) return null;
    return {
      description: this.options.description,
      amount: Math.floor(matching.length / 2) * percentOff(product.price, this.options.percentOff),
    };
  }
}
