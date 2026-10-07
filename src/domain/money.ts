/** An integer number of US cents. Never a float. */
export type Cents = number;

/**
 * Returns the discount in cents, rounding up in the customer's favour.
 * The brief's R01, R01 basket reaches $54.37 only with this rounding.
 */
export const percentOff = (amount: Cents, percent: number): Cents =>
  Math.ceil((amount * percent) / 100);
