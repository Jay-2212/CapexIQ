// Investment Outlook score — financial-model-spec.md §1

export type InvestmentOutlookBand =
  | "Strong"
  | "Moderate"
  | "Caution"
  | "Weak";

export type InvestmentOutlookDriver =
  | "returnStrength"
  | "speedToPayback"
  | "financingResilience"
  | "operationalMarginOfSafety";

export interface InvestmentOutlookInputs {
  irr: number | null;
  discountRate: number;
  npv: number;
  initialInvestment: number;
  discountedPaybackYears: number | null;
  usefulLifeYears: number;
  financingType: "cash" | "loan" | "lease";
  monthlyOperatingCashFlowBeforeEmi: number;
  monthlyEmi: number;
  usagePerDay: number;
  breakEvenUsagePerDay: number | null;
}

export interface InvestmentOutlookResult {
  score: number;
  unroundedScore: number;
  band: InvestmentOutlookBand;
  driver: InvestmentOutlookDriver;
  driverFraming: "risk" | "strength";
  subScores: {
    returnStrength: number;
    speedToPayback: number;
    financingResilience: number | null;
    operationalMarginOfSafety: number;
  };
}

function returnStrengthScore(inputs: InvestmentOutlookInputs): number {
  if (inputs.irr === null) {
    const ratio = inputs.npv / inputs.initialInvestment;

    if (ratio <= -0.2) return 0;
    if (ratio <= 0) return ((ratio + 0.2) / 0.2) * 50;
    if (ratio <= 0.5) return 50 + (ratio / 0.5) * 50;
    return 100;
  }

  const spread = inputs.irr - inputs.discountRate;

  if (spread <= -5) return 0;
  if (spread <= 0) return ((spread + 5) / 5) * 50;
  if (spread <= 10) return 50 + (spread / 10) * 50;
  return 100;
}

function speedToPaybackScore(inputs: InvestmentOutlookInputs): number {
  if (inputs.discountedPaybackYears === null) return 0;

  const ratio = inputs.discountedPaybackYears / inputs.usefulLifeYears;

  if (ratio >= 1) return 0;
  if (ratio >= 0.5) return ((1 - ratio) / 0.5) * 50;
  if (ratio >= 0.2) return 50 + ((0.5 - ratio) / 0.3) * 50;
  return 100;
}

function financingResilienceScore(inputs: InvestmentOutlookInputs): number {
  const dscr =
    inputs.monthlyOperatingCashFlowBeforeEmi / inputs.monthlyEmi;

  if (dscr <= 1) return 0;
  if (dscr <= 1.5) return ((dscr - 1) / 0.5) * 50;
  if (dscr <= 2) return 50 + ((dscr - 1.5) / 0.5) * 50;
  return 100;
}

function operationalMarginScore(inputs: InvestmentOutlookInputs): number {
  if (inputs.usagePerDay === 0 || inputs.breakEvenUsagePerDay === null) {
    return 0;
  }

  const cushion =
    (inputs.usagePerDay - inputs.breakEvenUsagePerDay) / inputs.usagePerDay;

  if (cushion <= 0) return 0;
  if (cushion <= 0.2) return (cushion / 0.2) * 50;
  if (cushion <= 0.5) return 50 + ((cushion - 0.2) / 0.3) * 50;
  return 100;
}

function bandForScore(score: number): InvestmentOutlookBand {
  if (score >= 75) return "Strong";
  if (score >= 55) return "Moderate";
  if (score >= 35) return "Caution";
  return "Weak";
}

export function investmentOutlookScore(
  inputs: InvestmentOutlookInputs
): InvestmentOutlookResult {
  const returnStrength = returnStrengthScore(inputs);
  const speedToPayback = speedToPaybackScore(inputs);
  const financingResilience =
    inputs.financingType === "cash"
      ? null
      : financingResilienceScore(inputs);
  const operationalMarginOfSafety = operationalMarginScore(inputs);
  const weightedScores: Array<{
    driver: InvestmentOutlookDriver;
    score: number;
    weight: number;
  }> =
    financingResilience === null
      ? [
          { driver: "returnStrength", score: returnStrength, weight: 0.4375 },
          { driver: "speedToPayback", score: speedToPayback, weight: 0.3125 },
          {
            driver: "operationalMarginOfSafety",
            score: operationalMarginOfSafety,
            weight: 0.25,
          },
        ]
      : [
          { driver: "returnStrength", score: returnStrength, weight: 0.35 },
          { driver: "speedToPayback", score: speedToPayback, weight: 0.25 },
          {
            driver: "financingResilience",
            score: financingResilience,
            weight: 0.2,
          },
          {
            driver: "operationalMarginOfSafety",
            score: operationalMarginOfSafety,
            weight: 0.2,
          },
        ];
  const unroundedScore = weightedScores.reduce(
    (total, component) => total + component.score * component.weight,
    0
  );
  const driverComponent = weightedScores.reduce((lowest, component) =>
    component.score < lowest.score ? component : lowest
  );

  return {
    score: Math.round(unroundedScore),
    unroundedScore,
    band: bandForScore(Math.round(unroundedScore)),
    driver: driverComponent.driver,
    driverFraming: driverComponent.score >= 55 ? "strength" : "risk",
    subScores: {
      returnStrength,
      speedToPayback,
      financingResilience,
      operationalMarginOfSafety,
    },
  };
}
