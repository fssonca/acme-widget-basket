import type { Catalogue, Product } from "./catalogue.js";
import type { DeliveryRule } from "./delivery-rule.js";
import type { Cents } from "./money.js";
import type { AppliedDiscount, Offer } from "./offer.js";

/** Shared, stateless collaborators injected into each basket. */
export interface PricingRules {
  readonly catalogue: Catalogue;
  readonly delivery: DeliveryRule;
  readonly offers: readonly Offer[];
}

/** An undiscounted quote line, grouped by product code. */
export interface QuoteLine {
  readonly code: string;
  readonly name: string;
  readonly unitPrice: Cents;
  readonly quantity: number;
  readonly lineTotal: Cents;
}

/** The complete price breakdown; every monetary value is in cents. */
export interface Quote {
  readonly lines: readonly QuoteLine[];
  readonly subtotal: Cents;
  readonly discounts: readonly AppliedDiscount[];
  readonly delivery: Cents;
  readonly total: Cents;
}

export class Basket {
  private readonly items: Product[] = [];

  constructor(private readonly rules: PricingRules) {}

  /** Looks the code up before adding, so an unknown code leaves the basket unchanged. */
  add(code: string): void {
    this.items.push(this.rules.catalogue.get(code));
  }

  quote(): Quote {
    const subtotal = this.items.reduce((sum, item) => sum + item.price, 0);
    const discounts: AppliedDiscount[] = [];
    for (const offer of this.rules.offers) {
      const discount = offer.apply(this.items);
      if (discount) discounts.push(discount);
    }
    const discounted = Math.max(
      0,
      subtotal - discounts.reduce((sum, discount) => sum + discount.amount, 0),
    );
    // The brief's two-red example requires delivery on the discounted subtotal.
    const delivery = this.items.length === 0 ? 0 : this.rules.delivery.chargeFor(discounted);

    const lines = new Map<string, QuoteLine>();
    for (const item of this.items) {
      const previous = lines.get(item.code);
      lines.set(item.code, {
        code: item.code,
        name: item.name,
        unitPrice: item.price,
        quantity: (previous?.quantity ?? 0) + 1,
        lineTotal: (previous?.lineTotal ?? 0) + item.price,
      });
    }

    return {
      lines: [...lines.values()],
      subtotal,
      discounts,
      delivery,
      total: discounted + delivery,
    };
  }

  total(): Cents {
    return this.quote().total;
  }
}
