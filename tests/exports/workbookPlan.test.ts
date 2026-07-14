// The load-bearing verification for Phase 8's "live Excel formulas" requirement.
// The DoD explicitly disowns a check that merely proves a formula *string* is
// present ("verify by actually opening the file and clicking cells, not by checking
// the numbers match") — since no Excel/LibreOffice is available in this headless
// environment, HyperFormula (a real formula-evaluation engine, not a parallel
// reimplementation of /formulas) is used as the closest available proxy: it evaluates
// the *exact same cell plan* exports/workbookPlan.ts hands to exceljs, and every
// evaluated result is checked against computeAssessment()/buildMonthlySeries()'s own
// numbers — not spot-checked, but cell-by-cell across two structurally different
// scenarios (a simple cash purchase, and a financed + ramped + multi-payer-DSO
// scenario), per the advisor review that shaped this test file.

import { describe, expect, it } from "vitest";
import { HyperFormula } from "hyperformula";
import { computeAssessment, AssessmentInputs } from "../../formulas/computeAssessment";
import { buildMonthlySeries } from "../../formulas/monthlySeries";
import { buildWorkbookPlan, CellPlan } from "../../exports/workbookPlan";

/** refs.* addresses look like `Sheet!$B$3` or `'Sheet With Space'!$B$3` — strip the
 *  quoting Excel formula syntax requires for space-containing sheet names before
 *  looking the sheet up by name. */
function parseRef(ref: string): { sheet: string; address: string } {
  const [rawSheet, address] = ref.split("!");
  const sheet = rawSheet.replace(/^'|'$/g, "");
  return { sheet, address: address.replace(/\$/g, "") };
}

function evaluatePlan(cells: CellPlan[]) {
  const sheetNames = Array.from(new Set(cells.map((c) => c.sheet)));
  const sheets: Record<string, (string | number)[][]> = {};
  const addressToRowCol = (address: string) => {
    const match = address.match(/^([A-Z]+)(\d+)$/)!;
    const colLetters = match[1];
    let col = 0;
    for (const ch of colLetters) col = col * 26 + (ch.charCodeAt(0) - 64);
    col -= 1;
    const row = parseInt(match[2], 10) - 1;
    return { row, col };
  };

  sheetNames.forEach((name) => (sheets[name] = []));
  for (const cell of cells) {
    const { row, col } = addressToRowCol(cell.address);
    const grid = sheets[cell.sheet];
    while (grid.length <= row) grid.push([]);
    while (grid[row].length <= col) grid[row].push("");
    grid[row][col] = cell.formula !== undefined ? `=${cell.formula}` : (cell.value as string | number);
  }

  const hf = HyperFormula.buildFromSheets(sheets, { licenseKey: "gpl-v3" });
  return {
    hf,
    get(sheet: string, address: string): unknown {
      const { row, col } = addressToRowCol(address);
      const sheetId = hf.getSheetId(sheet)!;
      return hf.getCellValue({ sheet: sheetId, row, col });
    },
  };
}

function checkNoErrors(hf: HyperFormula, sheetNames: string[]) {
  for (const name of sheetNames) {
    const sheetId = hf.getSheetId(name)!;
    const data = hf.getSheetValues(sheetId);
    data.forEach((rowValues, rowIndex) => {
      rowValues.forEach((value, colIndex) => {
        if (value && typeof value === "object" && "type" in (value as object)) {
          throw new Error(
            `Formula error at ${name}!R${rowIndex + 1}C${colIndex + 1}: ${JSON.stringify(value)}`
          );
        }
      });
    });
  }
}

describe("workbookPlan — golden scenario A (simple cash purchase)", () => {
  const inputs: AssessmentInputs = {
    purchaseCost: 2_000_000,
    installationCost: 100_000,
    usagePerDay: 10,
    workingDaysPerMonth: 25,
    payerMix: [
      { payerName: "privateCash", shareOfVolume: 100, billedTariff: 800, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "insuranceTpa", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "corporateCredit", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "pmJayGovt", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "other", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
    ],
    variableCostPerUse: 50,
    fixedCostPerMonth: 40_000 + 5_000,
    financing: { type: "cash" },
    maintenance: { warrantyYears: 5, cmcYears: 2, cmcAnnualCost: 60_000, amcAnnualCost: 40_000 },
    usefulLifeYears: 8,
    discountRate: 12.5,
    salvageValuePercentage: 5,
  };
  const result = computeAssessment(inputs);
  const monthly = buildMonthlySeries(inputs);
  const plan = buildWorkbookPlan(inputs, result, monthly);
  const evaluated = evaluatePlan(plan.cells);

  it("produces no formula errors anywhere in the workbook", () => {
    checkNoErrors(evaluated.hf, plan.sheetOrder);
  });

  it("NPV formula evaluates to computeAssessment's result.npv", () => {
    const { sheet, address } = parseRef(plan.refs.npv);
    const value = evaluated.get(sheet, address);
    expect(value as number).toBeCloseTo(result.npv, 0);
  });

  it("IRR formula evaluates to computeAssessment's result.irr", () => {
    expect(plan.refs.irr).not.toBeNull();
    const { sheet, address } = parseRef(plan.refs.irr!);
    const value = evaluated.get(sheet, address);
    expect((value as number) * 100).toBeCloseTo(result.irr!, 1);
  });

  it("break-even usage per day formula matches computeAssessment's result.breakEvenUsagePerDay", () => {
    const { sheet, address } = parseRef(plan.refs.breakEvenUsagePerDay);
    const value = evaluated.get(sheet, address);
    expect(value as number).toBeCloseTo(result.breakEvenUsagePerDay!, 4);
  });

  it("every monthly net-cash-flow formula cell matches buildMonthlySeries's monthlyNetCashFlowAfterFinancing", () => {
    const { sheet, firstRow, lastRow, col } = plan.refs.monthlyNetCashFlowRange;
    for (let row = firstRow; row <= lastRow; row += 1) {
      const value = evaluated.get(sheet, `${col}${row}`);
      const monthIndex = row - firstRow;
      expect(value as number).toBeCloseTo(monthly.monthlyNetCashFlowAfterFinancing[monthIndex], 2);
    }
  });

  it("every annual net-cash-flow formula cell matches computeAssessment's annualNetCashFlowsAfterFinancing", () => {
    const { sheet, firstRow, lastRow, col } = plan.refs.annualNetCashFlowRange;
    for (let row = firstRow; row <= lastRow; row += 1) {
      const value = evaluated.get(sheet, `${col}${row}`);
      const yearIndex = row - firstRow;
      expect(value as number).toBeCloseTo(result.annualNetCashFlowsAfterFinancing[yearIndex], 2);
    }
  });

  it("cumulative cash position formula matches formulas/roi.ts's cumulativeCashFlowSeries", () => {
    const expected: number[] = [];
    let running = -result.initialInvestment;
    for (const cf of result.annualNetCashFlowsAfterFinancing) {
      running += cf;
      expected.push(running);
    }
    const { sheet, firstRow, lastRow, col } = plan.refs.annualCumulativeCashPosition;
    for (let row = firstRow; row <= lastRow; row += 1) {
      const value = evaluated.get(sheet, `${col}${row}`);
      expect(value as number).toBeCloseTo(expected[row - firstRow], 2);
    }
  });
});

describe("workbookPlan — golden scenario B (financed, ramped, multi-payer DSO)", () => {
  const inputs: AssessmentInputs = {
    purchaseCost: 30_000_000,
    installationCost: 3_000_000,
    usagePerDay: 20,
    workingDaysPerMonth: 25,
    payerMix: [
      { payerName: "privateCash", shareOfVolume: 50, billedTariff: 6000, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "insuranceTpa", shareOfVolume: 30, billedTariff: 6000, realizationPercentage: 85, collectionDelayDays: 60 },
      { payerName: "corporateCredit", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "pmJayGovt", shareOfVolume: 20, billedTariff: 4500, realizationPercentage: 90, collectionDelayDays: 90 },
      { payerName: "other", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
    ],
    variableCostPerUse: 2000,
    fixedCostPerMonth: 300_000 + 150_000 + 50_000,
    financing: { type: "loan", downPayment: 0.2 * 33_000_000, interestRate: 11.5, tenureMonths: 60 },
    maintenance: { warrantyYears: 5, cmcYears: 5, cmcAnnualCost: 0.065 * 30_000_000, amcAnnualCost: 0 },
    usefulLifeYears: 10,
    discountRate: 12.5,
    salvageValuePercentage: 5,
    utilizationRamp: { month1to3Pct: 50, month4to6Pct: 75, month7to12Pct: 90, year2PlusPct: 100 },
  };
  const result = computeAssessment(inputs);
  const monthly = buildMonthlySeries(inputs);
  const plan = buildWorkbookPlan(inputs, result, monthly);
  const evaluated = evaluatePlan(plan.cells);

  it("produces no formula errors anywhere in the workbook", () => {
    checkNoErrors(evaluated.hf, plan.sheetOrder);
  });

  it("NPV formula evaluates to computeAssessment's result.npv", () => {
    const { sheet, address } = parseRef(plan.refs.npv);
    const value = evaluated.get(sheet, address);
    expect(value as number).toBeCloseTo(result.npv, 0);
  });

  it("IRR formula evaluates to computeAssessment's result.irr", () => {
    const { sheet, address } = parseRef(plan.refs.irr!);
    const value = evaluated.get(sheet, address);
    expect((value as number) * 100).toBeCloseTo(result.irr!, 1);
  });

  it("every monthly net-cash-flow formula cell matches buildMonthlySeries's monthlyNetCashFlowAfterFinancing (ramped + financed)", () => {
    const { sheet, firstRow, lastRow, col } = plan.refs.monthlyNetCashFlowRange;
    for (let row = firstRow; row <= lastRow; row += 1) {
      const value = evaluated.get(sheet, `${col}${row}`);
      const monthIndex = row - firstRow;
      expect(value as number).toBeCloseTo(monthly.monthlyNetCashFlowAfterFinancing[monthIndex], 2);
    }
  });

  it("Monthly sheet's Billed revenue column ramps the same way as Realized revenue (ISS-29)", () => {
    const month1Billed = evaluated.get("Monthly", "C2") as number; // month 1, ramp 50%
    const matureBilled = evaluated.get("Monthly", "C26") as number; // month 25, year 2+, ramp 100%
    expect(month1Billed).toBeCloseTo(matureBilled * 0.5, 2);
    expect(month1Billed).toBeCloseTo(monthly.monthlyBilledRevenue[0], 2);
    expect(matureBilled).toBeCloseTo(monthly.monthlyBilledRevenue[24], 2);
  });

  it("cash-received-total formula cells sum (across the full DSO-extended horizon) to total realized revenue — cash conservation, matching formulas/dso.ts", () => {
    const totalMonths = inputs.usefulLifeYears * 12;
    const monthlySheetRows = monthly.monthlyCashReceived.length;
    let totalFromExcel = 0;
    for (let i = 0; i < monthlySheetRows; i += 1) {
      const row = 2 + i;
      totalFromExcel += evaluated.get("Monthly", `P${row}`) as number;
    }
    const totalRealized = monthly.monthlyRealizedRevenue.slice(0, totalMonths).reduce((t, v) => t + v, 0);
    expect(totalFromExcel).toBeCloseTo(totalRealized, 2);
  });

  it("every monthly cash-received-total formula cell matches buildMonthlySeries's monthlyCashReceived", () => {
    const monthlySheetRows = monthly.monthlyCashReceived.length;
    for (let i = 0; i < monthlySheetRows; i += 1) {
      const row = 2 + i;
      const value = evaluated.get("Monthly", `P${row}`);
      expect(value as number).toBeCloseTo(monthly.monthlyCashReceived[i], 2);
    }
  });

  it("EMI stops after the loan tenure, matching monthlyEmiOrLease", () => {
    // Month n sits at sheet row (firstDataRow=2) + (n-1) = n+1.
    const month61 = evaluated.get("Monthly", "I62"); // first month past the 60-month tenure
    expect(month61 as number).toBe(0);
    const month60 = evaluated.get("Monthly", "I61"); // last month of the tenure
    expect(month60 as number).toBeGreaterThan(0);
    expect(month60 as number).toBeCloseTo(monthly.monthlyEmiOrLease[59], 2);
  });
});

describe("workbookPlan — golden scenario C (per-year maintenance override, ISS-19)", () => {
  // An advisor review flagged that `costByYearPct` (app/advanced/
  // MaintenanceScheduleFields.tsx — a real, UI-reachable Advanced-mode field) is
  // applied by computeAssessment()/buildMonthlySeries() but neither golden scenario
  // A nor B ever set it, so a workbookPlan bug here would have shipped invisibly.
  const inputs: AssessmentInputs = {
    purchaseCost: 2_000_000,
    installationCost: 100_000,
    usagePerDay: 10,
    workingDaysPerMonth: 25,
    payerMix: [
      { payerName: "privateCash", shareOfVolume: 100, billedTariff: 800, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "insuranceTpa", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "corporateCredit", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "pmJayGovt", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "other", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
    ],
    variableCostPerUse: 50,
    fixedCostPerMonth: 45_000,
    financing: { type: "cash" },
    maintenance: {
      warrantyYears: 5,
      cmcYears: 2,
      cmcAnnualCost: 60_000,
      amcAnnualCost: 40_000,
      // Year 1 and year 6 overridden; every other year keeps the standard ladder.
      costByYearPct: [8, null, null, null, null, 3, null, null],
    },
    usefulLifeYears: 8,
    discountRate: 12.5,
    salvageValuePercentage: 5,
  };
  const result = computeAssessment(inputs);
  const monthly = buildMonthlySeries(inputs);
  const plan = buildWorkbookPlan(inputs, result, monthly);
  const evaluated = evaluatePlan(plan.cells);

  it("produces no formula errors anywhere in the workbook", () => {
    checkNoErrors(evaluated.hf, plan.sheetOrder);
  });

  it("Maintenance Schedule tab's overridden years match the override percentage, not the standard ladder", () => {
    // Year 1 override: 8% of purchase cost, overriding warranty's normal 0 cost.
    expect(evaluated.get("Maintenance Schedule", "C2") as number).toBeCloseTo(0.08 * inputs.purchaseCost, 2);
    expect(evaluated.get("Maintenance Schedule", "B2")).toBe("Override");
    // Year 6 override: 3% of purchase cost, overriding what would otherwise be AMC (40,000).
    expect(evaluated.get("Maintenance Schedule", "C7") as number).toBeCloseTo(0.03 * inputs.purchaseCost, 2);
    // Year 2 (no override): standard ladder still applies (within warranty -> 0).
    expect(evaluated.get("Maintenance Schedule", "C3") as number).toBe(0);
  });

  it("NPV formula reflects the override (not the un-overridden ladder), matching computeAssessment's result.npv", () => {
    const { sheet, address } = parseRef(plan.refs.npv);
    const value = evaluated.get(sheet, address);
    expect(value as number).toBeCloseTo(result.npv, 0);
  });

  it("every annual net-cash-flow formula cell matches computeAssessment's annualNetCashFlowsAfterFinancing with the override applied", () => {
    const { sheet, firstRow, lastRow, col } = plan.refs.annualNetCashFlowRange;
    for (let row = firstRow; row <= lastRow; row += 1) {
      const value = evaluated.get(sheet, `${col}${row}`);
      const yearIndex = row - firstRow;
      expect(value as number).toBeCloseTo(result.annualNetCashFlowsAfterFinancing[yearIndex], 2);
    }
  });

  it("every monthly net-cash-flow formula cell matches buildMonthlySeries's monthlyNetCashFlowAfterFinancing with the override applied", () => {
    const { sheet, firstRow, lastRow, col } = plan.refs.monthlyNetCashFlowRange;
    for (let row = firstRow; row <= lastRow; row += 1) {
      const value = evaluated.get(sheet, `${col}${row}`);
      const monthIndex = row - firstRow;
      expect(value as number).toBeCloseTo(monthly.monthlyNetCashFlowAfterFinancing[monthIndex], 2);
    }
  });
});

describe("workbookPlan — golden scenario D (lease financing, ISS-18 tenure-cutoff semantics)", () => {
  const inputs: AssessmentInputs = {
    purchaseCost: 5_000_000,
    installationCost: 300_000,
    usagePerDay: 12,
    workingDaysPerMonth: 25,
    payerMix: [
      { payerName: "privateCash", shareOfVolume: 100, billedTariff: 1200, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "insuranceTpa", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "corporateCredit", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "pmJayGovt", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "other", shareOfVolume: 0, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
    ],
    variableCostPerUse: 80,
    fixedCostPerMonth: 60_000,
    financing: { type: "lease", rentalPerMonth: 90_000, tenureMonths: 36 },
    maintenance: { warrantyYears: 3, cmcYears: 2, cmcAnnualCost: 50_000, amcAnnualCost: 35_000 },
    usefulLifeYears: 6,
    discountRate: 12.5,
    salvageValuePercentage: 5,
  };
  const result = computeAssessment(inputs);
  const monthly = buildMonthlySeries(inputs);
  const plan = buildWorkbookPlan(inputs, result, monthly);
  const evaluated = evaluatePlan(plan.cells);

  it("produces no formula errors anywhere in the workbook", () => {
    checkNoErrors(evaluated.hf, plan.sheetOrder);
  });

  it("NPV formula evaluates to computeAssessment's result.npv under lease financing", () => {
    const { sheet, address } = parseRef(plan.refs.npv);
    const value = evaluated.get(sheet, address);
    expect(value as number).toBeCloseTo(result.npv, 0);
  });

  it("rental applies flat every month through the tenure, then drops to zero — matching monthlyEmiOrLease (ISS-18)", () => {
    const month36 = evaluated.get("Monthly", "I37"); // last month of the 36-month tenure
    const month37 = evaluated.get("Monthly", "I38"); // first month past tenure — owned outright
    expect(month36 as number).toBeCloseTo(inputs.financing.type === "lease" ? inputs.financing.rentalPerMonth : 0, 2);
    expect(month37 as number).toBe(0);
    expect(month36 as number).toBeCloseTo(monthly.monthlyEmiOrLease[35], 2);
    expect(month37 as number).toBeCloseTo(monthly.monthlyEmiOrLease[36], 2);
  });

  it("every annual net-cash-flow formula cell matches computeAssessment's annualNetCashFlowsAfterFinancing under lease financing", () => {
    const { sheet, firstRow, lastRow, col } = plan.refs.annualNetCashFlowRange;
    for (let row = firstRow; row <= lastRow; row += 1) {
      const value = evaluated.get(sheet, `${col}${row}`);
      const yearIndex = row - firstRow;
      expect(value as number).toBeCloseTo(result.annualNetCashFlowsAfterFinancing[yearIndex], 2);
    }
  });
});
