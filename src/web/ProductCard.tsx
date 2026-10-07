import type { Product } from "../domain/catalogue";
import { formatMoney } from "./format";

/** Catalogue data and the action to add one product to the basket. */
export interface ProductCardProps {
  readonly product: Product;
  readonly onAdd: (code: string) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="product-card" data-code={product.code}>
      <div className="product-art" aria-hidden="true">
        <span className="widget-swatch">
          <span />
        </span>
      </div>
      <div className="product-info">
        <span className="product-code">{product.code}</span>
        <h3>{product.name}</h3>
        <p className="product-price">{formatMoney(product.price)}</p>
      </div>
      <button
        className="add-button"
        type="button"
        aria-label={`Add ${product.name}`}
        onClick={() => onAdd(product.code)}
      >
        <span aria-hidden="true">+</span> Add
      </button>
    </article>
  );
}
