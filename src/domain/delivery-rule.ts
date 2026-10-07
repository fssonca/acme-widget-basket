import type { Cents } from "./money.js";

/** Strategy: the delivery charge for a subtotal with discounts already applied. */
export interface DeliveryRule {
  chargeFor(subtotal: Cents): Cents;
}
