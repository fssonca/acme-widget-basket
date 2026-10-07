import type { ReactNode } from "react";
import type { Quote } from "../domain/basket";
import { formatMoney } from "./format";

/** Subtotal, discounts, delivery and total, exactly as the server calculated them. */
export interface PriceBreakdownProps {
  /** Null while the basket is empty or waiting for its first quote. */
  readonly quote: Quote | null;
  /** True when items are waiting for their first quote, so no misleading $0.00 is shown. */
  readonly awaitingQuote: boolean;
}

const PENDING = "—";

export function PriceBreakdown({ quote, awaitingQuote }: PriceBreakdownProps) {
  const amount = (cents = 0) => (awaitingQuote ? PENDING : formatMoney(cents));

  return (
    <>
      <dl>
        <div>
          <dt>Subtotal</dt>
          <dd>{amount(quote?.subtotal)}</dd>
        </div>
        {quote?.discounts.map((discount) => (
          <div className="discount-line" key={discount.description}>
            <dt>{discount.description}</dt>
            <dd>−{formatMoney(discount.amount)}</dd>
          </div>
        ))}
        <div>
          <dt>Delivery</dt>
          <dd>{deliveryAmount(quote)}</dd>
        </div>
      </dl>
      <div className="order-total">
        <span>
          Total <small>USD</small>
        </span>
        <output aria-label="Order total" aria-live="polite">
          {amount(quote?.total)}
        </output>
      </div>
    </>
  );
}

function deliveryAmount(quote: Quote | null): ReactNode {
  if (!quote) return PENDING;
  if (quote.delivery === 0) return <span className="free-delivery">Free</span>;
  return formatMoney(quote.delivery);
}
