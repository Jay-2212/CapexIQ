// Payer-wise realized revenue per use — SPEC.md §31.2, §15

export interface PayerMixEntry {
  payerName: string;
  shareOfVolume: number;
  billedTariff: number;
  realizationPercentage: number;
}

export function realizedRevenuePerUse(payerMix: PayerMixEntry[]): number {
  throw new Error("not implemented");
}
