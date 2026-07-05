// Cash received by month, shifted by payer-wise collection delay / DSO — SPEC.md §31.4

export interface PayerCollectionProfile {
  payerName: string;
  shareOfVolume: number;
  daysToCollect: number;
}

export function cashReceivedByMonth(
  monthlyRealizedRevenueSeries: number[],
  payerCollectionProfiles: PayerCollectionProfile[]
): number[] {
  throw new Error("not implemented");
}
