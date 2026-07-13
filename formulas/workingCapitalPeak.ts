// Peak working-capital need across a DSO-extended cash-received horizon —
// financial-model-spec.md's dashboard-warning framing (SPEC.md §14.2: "may require
// approximately INR X working capital support during the first Y months"), built on
// top of workingCapitalGap()/cashReceivedByMonth() rather than only checking the
// end-of-horizon convergence those two already prove (see PBA-3,
// tests/scenarios/financed-payer-mix-dso.test.ts).

import { cashReceivedByMonth, PayerCollectionProfile } from "./dso";
import { workingCapitalGap } from "./workingCapital";

export interface WorkingCapitalPeak {
  peakGap: number;
  peakMonthIndex: number;
}

export function peakWorkingCapitalGap(
  monthlyRealizedRevenueSeries: number[],
  payerCollectionProfiles: PayerCollectionProfile[]
): WorkingCapitalPeak {
  const cashReceived = cashReceivedByMonth(
    monthlyRealizedRevenueSeries,
    payerCollectionProfiles
  );

  let cumulativeRealized = 0;
  let cumulativeCash = 0;
  let peakGap = 0;
  let peakMonthIndex = 0;

  for (let monthIndex = 0; monthIndex < cashReceived.length; monthIndex += 1) {
    cumulativeRealized += monthlyRealizedRevenueSeries[monthIndex] ?? 0;
    cumulativeCash += cashReceived[monthIndex];
    const gap = workingCapitalGap(cumulativeRealized, cumulativeCash);

    if (gap > peakGap) {
      peakGap = gap;
      peakMonthIndex = monthIndex;
    }
  }

  return { peakGap, peakMonthIndex };
}
