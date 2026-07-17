export function roundGbp(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
