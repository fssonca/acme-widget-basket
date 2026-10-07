import { useEffect, useState } from "react";
import type { Quote } from "../domain/basket";
import type { Product } from "../domain/catalogue";
import { fetchQuote, getProducts } from "./api";
import { BasketSummary } from "./BasketSummary";
import { ProductCard } from "./ProductCard";

export function App() {
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getProducts(controller.signal)
      .then((next) => {
        if (!controller.signal.aborted) setProducts(next);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setProductsError(error instanceof Error ? error.message : "Unable to load products");
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (codes.length === 0) {
      setQuote(null);
      setQuoteError(null);
      setIsQuoting(false);
      return;
    }
    const controller = new AbortController();
    setIsQuoting(true);
    fetchQuote(codes, controller.signal)
      .then((next) => {
        if (!controller.signal.aborted) {
          setQuote(next);
          setQuoteError(null);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setQuoteError(error instanceof Error ? error.message : "Unable to price your basket");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsQuoting(false);
      });
    return () => controller.abort();
  }, [codes]);

  function add(code: string) {
    setCodes((previous) => [...previous, code]);
  }

  function remove(code: string) {
    setCodes((previous) => {
      const index = previous.indexOf(code);
      return previous.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Acme Widget Co. home">
          <span className="brand-mark" aria-hidden="true">
            a
          </span>
          Acme Widget Co.
        </a>
      </header>

      <main>
        <div className="intro">
          <h1>Widget basket</h1>
          <p>Add widgets to your basket to see the price breakdown.</p>
        </div>

        <div className="shop-layout">
          <section className="collection" aria-labelledby="collection-title">
            <div className="collection-heading">
              <h2 id="collection-title">Products</h2>
            </div>
            <div className="product-list">
              {products.map((product) => (
                <ProductCard key={product.code} product={product} onAdd={add} />
              ))}
              {products.length === 0 && !productsError && (
                <p role="status">Loading the collection…</p>
              )}
              {productsError && (
                <p className="api-error" role="alert">
                  Could not load the collection: {productsError}. Refresh to try again.
                </p>
              )}
            </div>
          </section>

          <BasketSummary
            quote={quote}
            itemCount={codes.length}
            isQuoting={isQuoting}
            error={quoteError}
            onAdd={add}
            onRemove={remove}
            onClear={() => setCodes([])}
          />
        </div>
      </main>

      <footer className="site-footer">
        <span>Acme Widget Co.</span>
        <span>All prices in USD.</span>
      </footer>
    </div>
  );
}
