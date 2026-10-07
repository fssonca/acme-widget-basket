import type { DeliveryRule } from "./delivery-rule.js";
import type { Cents } from "./money.js";

/** A delivery tier applies when the discounted subtotal is at least `from`. */
export interface DeliveryTier {
  readonly from: Cents;
  readonly charge: Cents;
}

export class TieredDelivery implements DeliveryRule {
  private readonly tiers: readonly DeliveryTier[];

  constructor(tiers: readonly DeliveryTier[]) {
    for (const { from, charge } of tiers) {
      if (!Number.isSafeInteger(from) || from < 0 || !Number.isSafeInteger(charge) || charge < 0) {
        throw new Error("Delivery thresholds and charges must be non-negative safe integers");
      }
    }
    if (!tiers.some((tier) => tier.from === 0)) {
      throw new Error("Delivery requires a tier starting at zero");
    }
    if (new Set(tiers.map((tier) => tier.from)).size !== tiers.length) {
      throw new Error("Duplicate delivery threshold");
    }
    this.tiers = tiers.map((tier) => ({ ...tier })).sort((a, b) => a.from - b.from);
  }

  chargeFor(subtotal: Cents): Cents {
    let charge = 0;
    for (const tier of this.tiers) {
      if (tier.from > subtotal) break;
      charge = tier.charge;
    }
    return charge;
  }
}
