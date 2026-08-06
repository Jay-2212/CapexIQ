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
    // NPV has the same sign at both bracket ends (-99% and 1000%). This means either
    // (a) no discount rate in that range makes NPV cross zero at all, or (b) the cash
    // flow stream reverses sign more than once (e.g. a large mid-project cost after an
    // early positive year) and NPV has an even number of roots inside the bracket —
    // classic multiple-IRR cash flows can cross zero twice and end up back at the same
    // sign, which this same-sign check alone can't tell apart from "no root." Either
    // way, a single IRR isn't well-defined without an extra rule (e.g. "smallest
    // positive root") this project hasn't adopted — see ISSUES.md.
    throw new Error(
      "IRR is undefined: no single discount rate between -99% and 1000% makes NPV cross zero exactly once. This can mean no root exists, or that the cash flows change sign more than once and have multiple possible IRRs."
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
