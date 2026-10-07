import type { QuoteLine } from "../domain/basket";
import { formatMoney } from "./format";

/** Server-priced basket lines, each with buttons that change its quantity by one. */
export interface QuoteLinesProps {
  readonly lines: readonly QuoteLine[];
  readonly onAdd: (code: string) => void;
  readonly onRemove: (code: string) => void;
}

export function QuoteLines({ lines, onAdd, onRemove }: QuoteLinesProps) {
  return (
    <ul className="quote-lines">
      {lines.map((line) => (
        <li className="quote-line" key={line.code} data-code={line.code}>
          <span className="line-swatch" aria-hidden="true" />
          <div className="line-details">
            <h3>{line.name}</h3>
            <p>{formatMoney(line.unitPrice)} each</p>
            <fieldset className="quantity-control" aria-label={`${line.name} quantity`}>
              <button
                type="button"
                aria-label={`Remove one ${line.name}`}
                onClick={() => onRemove(line.code)}
              >
                −
              </button>
              <span>{line.quantity}</span>
              <button
                type="button"
                aria-label={`Add one ${line.name}`}
                onClick={() => onAdd(line.code)}
              >
                +
              </button>
            </fieldset>
          </div>
          <span className="line-price">{formatMoney(line.lineTotal)}</span>
        </li>
      ))}
    </ul>
  );
}
