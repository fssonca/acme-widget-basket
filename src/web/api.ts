import type { Quote } from "../domain/basket";
import type { Product } from "../domain/catalogue";

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(path, options);
  if (!response.ok) {
    const error: { message?: string } = await response.json().catch(() => ({}));
    throw new Error(error.message ?? `Request failed (${response.status})`);
  }
  return response.json();
}

export async function getProducts(signal?: AbortSignal): Promise<readonly Product[]> {
  const result = await request<{ products: Product[] }>("/api/products", { signal });
  return result.products;
}

export function fetchQuote(codes: readonly string[], signal: AbortSignal): Promise<Quote> {
  return request<Quote>("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: codes }),
    signal,
  });
}
