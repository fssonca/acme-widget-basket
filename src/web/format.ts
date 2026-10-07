import type { Cents } from "../domain/money";

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatMoney(cents: Cents): string {
  return dollars.format(cents / 100);
}
