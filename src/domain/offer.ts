import type { Product } from "./catalogue.js";
import type { Cents } from "./money.js";

/** A promotion's description and the amount taken off in cents. */
export interface AppliedDiscount {
  readonly description: string;
  readonly amount: Cents;
}

/** Strategy: a promotion. Returns null when it does not apply to these items. */
export interface Offer {
  apply(items: readonly Product[]): AppliedDiscount | null;
}
