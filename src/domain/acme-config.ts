import type { PricingRules } from "./basket.js";
import { Catalogue } from "./catalogue.js";
import { SecondItemPercentageDiscount } from "./second-item-percentage-discount.js";
import { TieredDelivery } from "./tiered-delivery.js";

export const acmePricing: PricingRules = {
  catalogue: new Catalogue([
    { code: "R01", name: "Red Widget", price: 3295 },
    { code: "G01", name: "Green Widget", price: 2495 },
    { code: "B01", name: "Blue Widget", price: 795 },
  ]),
  delivery: new TieredDelivery([
    { from: 0, charge: 495 },
    { from: 5000, charge: 295 },
    { from: 9000, charge: 0 },
  ]),
  offers: [
    new SecondItemPercentageDiscount({
      productCode: "R01",
      percentOff: 50,
      description: "Red Widget: second one half price",
    }),
  ],
};
