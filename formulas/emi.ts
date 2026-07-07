// Financing module: cash / loan / lease EMI logic — SPEC.md §19

export function monthlyEmi(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  if (annualInterestRate === 0) {
    return principal / tenureMonths;
  }

  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const compoundFactor = (1 + monthlyInterestRate) ** tenureMonths;

  return (
    (principal * monthlyInterestRate * compoundFactor) /
    (compoundFactor - 1)
  );
}
