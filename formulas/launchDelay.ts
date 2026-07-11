// Time-to-revenue, launch delay, pre-operative interest — SPEC.md §16

export function preOperativeInterest(
  principal: number,
  annualInterestRate: number,
  launchDelayMonths: number
): number {
  return principal * (annualInterestRate / 100 / 12) * launchDelayMonths;
}
