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

  const minimumRate = -99;
  const maximumRate = 1000;
  const scanSteps = 4096;
  const roots: number[] = [];
  let previousRate = minimumRate;
  let previousNpv = npv(previousRate, initialInvestment, cashFlowsByPeriod);

  // Checking only the two endpoints misses an even number of valid roots. Scan the
  // supported range first, then solve every sign-change interval precisely. When a
  // stream has several roots, show the smallest non-negative root: it is the
  // conservative, stable value for a decision report. If all roots are negative, use
  // the one closest to zero rather than reporting a false "undefined" result.
  for (let step = 1; step <= scanSteps; step += 1) {
    const rate = minimumRate + ((maximumRate - minimumRate) * step) / scanSteps;
    const currentNpv = npv(rate, initialInvestment, cashFlowsByPeriod);

    if (currentNpv === 0) {
      roots.push(rate);
    } else if (Math.sign(previousNpv) !== Math.sign(currentNpv)) {
      let lowerRate = previousRate;
      let upperRate = rate;
      let lowerNpv = previousNpv;

      for (let iteration = 0; iteration < 100; iteration += 1) {
        const midpointRate = (lowerRate + upperRate) / 2;
        const midpointNpv = npv(
          midpointRate,
          initialInvestment,
          cashFlowsByPeriod
        );

        if (Math.abs(midpointNpv) < 0.000001) {
          lowerRate = midpointRate;
          upperRate = midpointRate;
          break;
        }

        if (Math.sign(midpointNpv) === Math.sign(lowerNpv)) {
          lowerRate = midpointRate;
          lowerNpv = midpointNpv;
        } else {
          upperRate = midpointRate;
        }
      }

      roots.push((lowerRate + upperRate) / 2);
    }

    previousRate = rate;
    previousNpv = currentNpv;
  }

  if (roots.length === 0) {
    throw new Error(
      "IRR is undefined: no discount rate between -99% and 1000% makes NPV cross zero."
    );
  }

  const nonNegativeRoots = roots.filter((root) => root >= 0);
  return nonNegativeRoots.length > 0
    ? nonNegativeRoots[0]
    : roots[roots.length - 1];
}
