import type { ReactNode } from "react";
import type { Quote } from "../domain/basket";
import { PriceBreakdown } from "./PriceBreakdown";
import { QuoteLines } from "./QuoteLines";

/** A server quote and callbacks that change only product quantities. */
export interface BasketSummaryProps {
  readonly quote: Quote | null;
  readonly itemCount: number;
  readonly isQuoting: boolean;
  readonly error: string | null;
  readonly onAdd: (code: string) => void;
  readonly onRemove: (code: string) => void;
  readonly onClear: () => void;
}

export function BasketSummary({
  quote,
  itemCount,
  isQuoting,
  error,
  onAdd,
  onRemove,
  onClear,
}: BasketSummaryProps) {
  const isEmpty = itemCount === 0;
  // A cleared basket can still hold the previous quote until App's effect resets it.
  const currentQuote = isEmpty ? null : quote;

  let contents: ReactNode;
  if (isEmpty) {
    contents = <EmptyBasket />;
  } else if (currentQuote) {
    contents = <QuoteLines lines={currentQuote.lines} onAdd={onAdd} onRemove={onRemove} />;
  } else {
    contents = (
      <p className="first-quote">
        {error ? "Your items are waiting for a quote." : "Pricing your widgets…"}
      </p>
    );
  }

  return (
    <aside className="basket-panel" aria-labelledby="basket-title">
      <div className="basket-heading">
        <h2 id="basket-title">
          Your basket <span className="item-count">{itemCount}</span>
        </h2>
        <button
          className="clear-button"
          type="button"
          aria-label="Clear basket"
          disabled={isEmpty}
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      <div className="basket-items" aria-busy={isQuoting}>
        {contents}
      </div>

      <div className="price-breakdown">
        <PriceBreakdown quote={currentQuote} awaitingQuote={!isEmpty && !currentQuote} />
        <p className="quote-status" role="status">
          {statusMessage(isEmpty, isQuoting, error)}
        </p>
        {error && (
          <p className="api-error" role="alert">
            Could not update your basket: {error}
          </p>
        )}
      </div>
    </aside>
  );
}

function statusMessage(isEmpty: boolean, isQuoting: boolean, error: string | null): string {
  if (isQuoting) return "Updating prices…";
  if (error) return "Prices could not be updated";
  return isEmpty ? "Your basket is empty" : "Prices updated";
}

function EmptyBasket() {
  return (
    <div className="empty-basket">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M10 19h28l-3 20H13l-3-20Z M17 19l7-11 7 11 M20 26v6 M28 26v6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3>Your basket is waiting</h3>
      <p>Pick a widget to get things started.</p>
    </div>
  );
}
