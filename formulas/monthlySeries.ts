// Month-by-month breakdown — extracted from computeAssessment.ts (2026-07 Phase 8)
// so the Excel/Word export generators can consume the exact same monthly figures the
// annual pipeline is built from, rather than a second, independently-derived copy
// (CONVENTIONS.md §3). computeAssessment.ts imports utilizationFractionForMonth from
// here too; that extraction is a pure refactor, not a behavior change — see
// tests/formulas/computeAssessment.test.ts's golden-scenario numbers, unchanged by it.
// The rest of this file mirrors computeAssessment.ts's own top section (same formula
// calls, same arguments) rather than reimplementing any formula — no arithmetic here
// has a second implementation anywhere else.
//
// **Billed revenue is ramped the same way realized revenue is (Jay's decision,
// 2026-07-14, ISS-29).** Both figures are usagePerDay-driven — they differ only in
// which per-use rate is applied (gross tariff vs. realization-adjusted rate) — so a
// utilization ramp that depresses actual procedure volume in early months depresses
// both views identically; you can't bill for a procedure you didn't perform. This
// reuses the existing utilizationFractionForMonth() curve (no new numbers invented)
// and is contained entirely to this monthly series: computeAssessment.ts's headline
// monthlyBilledRevenue/roiBilled fields are untouched and stay flat, exactly mirroring
// how its headline monthlyRealizedRevenue/roiRealized/annualOperatingSurplus already
// use the flat, unramped figures too — only the cash-flow-timing metrics (NPV/IRR/
// discounted payback) and this monthly export series ever see the ramped numbers.

import type { AssessmentInputs } from "./computeAssessment";
import { billedMonthlyRevenue, monthlyRealizedRevenue } from "./revenue";
import { realizedRevenuePerUse, PayerMixEntry } from "./realization";
import { maintenanceScheduleForYears } from "./maintenance";
import { monthlyEmi } from "./emi";
import { cashReceivedByMonth, PayerCollectionProfile } from "./dso";

export function utilizationFractionForMonth(
  ramp: AssessmentInputs["utilizationRamp"],
  monthIndex: number
): number {
  if (!ramp) return 1;
  const monthNumber = monthIndex + 1;
  if (monthNumber <= 3) return ramp.month1to3Pct / 100;
  if (monthNumber <= 6) return ramp.month4to6Pct / 100;
  if (monthNumber <= 12) return ramp.month7to12Pct / 100;
  return ramp.year2PlusPct / 100;
}

export interface MonthlySeries {
  /** Ramped by the same utilizationFractionForMonth() curve as realized revenue
   *  (ISS-29, Jay's decision 2026-07-14) — flat only when there's no utilizationRamp. */
  monthlyBilledRevenue: number[];
  monthlyRealizedRevenue: number[];
  monthlyVariableCost: number[];
  /** Flat every month — inputs.fixedCostPerMonth has no ramp/seasonality concept. */
  monthlyFixedCost: number[];
  /** Each year's maintenanceScheduleForYears annualCost spread evenly across its 12
   *  months — the only sane derivation from annual warranty/CMC/AMC data without
   *  inventing a new sub-annual billing pattern. Does not apply the costByYearPct
   *  override (computeAssessment.ts applies that at the annual level only; no
   *  monthly-granularity override exists in the input schema). */
  monthlyMaintenanceCost: number[];
  /** DSO-shifted cash received, from the same cashReceivedByMonth() the working-
   *  capital-peak metric already uses — array may run longer than totalMonths by the
   *  maximum payer collection-delay offset. */
  monthlyCashReceived: number[];
  monthlyEmiOrLease: number[];
  /** Realized revenue minus variable/fixed/maintenance cost minus financing, per
   *  month — the monthly analogue of annualNetCashFlowsAfterFinancing. */
  monthlyNetCashFlowAfterFinancing: number[];
}

export function buildMonthlySeries(inputs: AssessmentInputs): MonthlySeries {
  const initialInvestment = inputs.purchaseCost + inputs.installationCost;
  const payerMixEntries: PayerMixEntry[] = inputs.payerMix.map((payer) => ({
    payerName: payer.payerName,
    shareOfVolume: payer.shareOfVolume,
    billedTariff: payer.billedTariff,
    realizationPercentage: payer.realizationPercentage,
  }));
  const realizedPerUse = realizedRevenuePerUse(payerMixEntries);
  const billedPerUseWeighted = inputs.payerMix.reduce(
    (total, payer) => total + (payer.shareOfVolume / 100) * payer.billedTariff,
    0
  );
  const monthlyRealizedFlat = monthlyRealizedRevenue(
    inputs.usagePerDay,
    realizedPerUse,
    inputs.workingDaysPerMonth
  );
  const monthlyBilledFlat = billedMonthlyRevenue(
    inputs.usagePerDay,
    billedPerUseWeighted,
    inputs.workingDaysPerMonth
  );
  const annualVariableCost =
    inputs.usagePerDay * inputs.variableCostPerUse * inputs.workingDaysPerMonth * 12;

  const baseMaintenanceSchedule = maintenanceScheduleForYears(
    inputs.maintenance.warrantyYears,
    inputs.maintenance.cmcYears,
    inputs.maintenance.cmcAnnualCost,
    inputs.maintenance.amcAnnualCost,
    inputs.usefulLifeYears
  );
  const maintenanceAnnualCostByYear = baseMaintenanceSchedule.map((entry, yearIndex) => {
    const overridePct = inputs.maintenance.costByYearPct?.[yearIndex];
    if (overridePct === null || overridePct === undefined) return entry.annualCost;
    return (overridePct / 100) * inputs.purchaseCost;
  });

  const monthlyPayment =
    inputs.financing.type === "loan"
      ? monthlyEmi(
          initialInvestment - inputs.financing.downPayment,
          inputs.financing.interestRate,
          inputs.financing.tenureMonths
        )
      : inputs.financing.type === "lease"
        ? inputs.financing.rentalPerMonth
        : 0;

  const totalMonths = inputs.usefulLifeYears * 12;
  const ramp = inputs.utilizationRamp;

  const monthlyBilledRevenue = Array.from({ length: totalMonths }, (_, monthIndex) =>
    monthlyBilledFlat * utilizationFractionForMonth(ramp, monthIndex)
  );
  const monthlyRealizedRevenue_ = Array.from({ length: totalMonths }, (_, monthIndex) =>
    monthlyRealizedFlat * utilizationFractionForMonth(ramp, monthIndex)
  );
  const monthlyVariableCost = Array.from({ length: totalMonths }, (_, monthIndex) =>
    (annualVariableCost / 12) * utilizationFractionForMonth(ramp, monthIndex)
  );
  const monthlyFixedCost = Array.from({ length: totalMonths }, () => inputs.fixedCostPerMonth);
  const monthlyMaintenanceCost = Array.from({ length: totalMonths }, (_, monthIndex) => {
    const yearIndex = Math.floor(monthIndex / 12);
    return (maintenanceAnnualCostByYear[yearIndex] ?? 0) / 12;
  });

  const payerCollectionProfiles: PayerCollectionProfile[] = inputs.payerMix.map((payer) => ({
    payerName: payer.payerName,
    shareOfVolume: payer.shareOfVolume,
    daysToCollect: payer.collectionDelayDays,
  }));
  const monthlyCashReceived = cashReceivedByMonth(monthlyRealizedRevenue_, payerCollectionProfiles);

  const monthlyEmiOrLease = Array.from({ length: totalMonths }, (_, monthIndex) => {
    if (inputs.financing.type === "cash") return 0;
    return monthIndex < inputs.financing.tenureMonths ? monthlyPayment : 0;
  });

  const monthlyNetCashFlowAfterFinancing = Array.from({ length: totalMonths }, (_, monthIndex) =>
    monthlyRealizedRevenue_[monthIndex] -
    monthlyVariableCost[monthIndex] -
    monthlyFixedCost[monthIndex] -
    monthlyMaintenanceCost[monthIndex] -
    monthlyEmiOrLease[monthIndex]
  );

  return {
    monthlyBilledRevenue,
    monthlyRealizedRevenue: monthlyRealizedRevenue_,
    monthlyVariableCost,
    monthlyFixedCost,
    monthlyMaintenanceCost,
    monthlyCashReceived,
    monthlyEmiOrLease,
    monthlyNetCashFlowAfterFinancing,
  };
}
