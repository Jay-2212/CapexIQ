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
  if (monthlyRealizedRevenueSeries.length === 0) {
    return [];
  }

  const maximumOffset = payerCollectionProfiles.reduce(
    (largestOffset, payer) =>
      Math.max(largestOffset, Math.ceil(payer.daysToCollect / 30)),
    0
  );
  const cashReceived = Array.from(
    { length: monthlyRealizedRevenueSeries.length + maximumOffset },
    () => 0
  );

  monthlyRealizedRevenueSeries.forEach((monthlyRevenue, monthIndex) => {
    payerCollectionProfiles.forEach((payer) => {
      const collectionMonth =
        monthIndex + Math.ceil(payer.daysToCollect / 30);
      cashReceived[collectionMonth] +=
        monthlyRevenue * (payer.shareOfVolume / 100);
    });
  });

  return cashReceived;
}
