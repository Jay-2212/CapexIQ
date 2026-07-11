// Payer-wise realized revenue per use — SPEC.md §31.2, §15

export interface PayerMixEntry {
  payerName: string;
  shareOfVolume: number;
  billedTariff: number;
  realizationPercentage: number;
}

export function realizedRevenuePerUse(payerMix: PayerMixEntry[]): number {
  return payerMix.reduce(
    (weightedRevenue, payer) =>
      weightedRevenue +
      (payer.shareOfVolume / 100) *
        payer.billedTariff *
        (payer.realizationPercentage / 100),
    0
  );
}
