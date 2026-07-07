// Internal rate of return — SPEC.md §31.15

import { npv } from "./npv";

export function irr(
  initialInvestment: number,
  cashFlowsByPeriod: number[]
): number {
  const cashFlowSigns = [-initialInvestment, ...cashFlowsByPeriod].map(
    (cashFlow) => Math.sign(cashFlow)
  );
  const hasPositiveCashFlow = cashFlowSigns.includes(1);
  const hasNegativeCashFlow = cashFlowSigns.includes(-1);

  if (!hasPositiveCashFlow || !hasNegativeCashFlow) {
    throw new Error(
      "IRR is undefined when cash flows do not include both positive and negative values."
    );
  }

  let lowerRate = -99;
  let upperRate = 1000;
  let lowerNpv = npv(lowerRate, initialInvestment, cashFlowsByPeriod);
  const upperNpv = npv(upperRate, initialInvestment, cashFlowsByPeriod);

  if (lowerNpv === 0) {
    return lowerRate;
  }

  if (upperNpv === 0) {
    return upperRate;
  }

  if (Math.sign(lowerNpv) === Math.sign(upperNpv)) {
    throw new Error(
      "IRR is undefined because no discount-rate sign change exists between -99% and 1000%."
    );
  }

  for (let iteration = 0; iteration < 100; iteration += 1) {
    const midpointRate = (lowerRate + upperRate) / 2;
    const midpointNpv = npv(
      midpointRate,
      initialInvestment,
      cashFlowsByPeriod
    );

    if (Math.abs(midpointNpv) < 0.000001) {
      return midpointRate;
    }

    if (Math.sign(midpointNpv) === Math.sign(lowerNpv)) {
      lowerRate = midpointRate;
      lowerNpv = midpointNpv;
    } else {
      upperRate = midpointRate;
    }
  }

  return (lowerRate + upperRate) / 2;
}
