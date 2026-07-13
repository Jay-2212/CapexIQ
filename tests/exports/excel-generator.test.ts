// Complements tests/exports/workbookPlan.test.ts's HyperFormula-based formula
// *correctness* check with an artifact-level check: that the actual bytes
// generateExcelWorkbook() produces, once round-tripped through exceljs, really do
// store live formulas (not pasted values) in downstream cells — the literal DoD
// wording ("shows real formulas ... in every downstream cell").

import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { computeAssessment, AssessmentInputs } from "../../formulas/computeAssessment";
import { generateExcelWorkbook } from "../../exports/excel-generator";

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
  maintenance: { warrantyYears: 5, cmcYears: 2, cmcAnnualCost: 60_000, amcAnnualCost: 40_000 },
  usefulLifeYears: 8,
  discountRate: 12.5,
  salvageValuePercentage: 5,
};

describe("generateExcelWorkbook", () => {
  it("produces a non-empty xlsx buffer with every expected sheet", async () => {
    const result = computeAssessment(inputs);
    const buffer = await generateExcelWorkbook(inputs, result);
    expect(buffer.byteLength).toBeGreaterThan(0);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(buffer) as any); // eslint-disable-line @typescript-eslint/no-explicit-any -- exceljs's Buffer type vs. workspace @types/node Buffer generic skew, runtime-safe
    const sheetNames = workbook.worksheets.map((s) => s.name);
    expect(sheetNames).toEqual([
      "Assumptions",
      "Monthly",
      "Annual Summary",
      "Break-even Analysis",
      "Maintenance Schedule",
      "Charts",
      "Formula Notes",
    ]);
  });

  it("stores live formulas (not pasted values) in downstream cells, round-tripped through a real xlsx write/read", async () => {
    const result = computeAssessment(inputs);
    const buffer = await generateExcelWorkbook(inputs, result);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(buffer) as any); // eslint-disable-line @typescript-eslint/no-explicit-any -- exceljs's Buffer type vs. workspace @types/node Buffer generic skew, runtime-safe

    const monthly = workbook.getWorksheet("Monthly")!;
    expect(typeof monthly.getCell("C2").formula).toBe("string");
    expect(monthly.getCell("C2").formula).toContain("Assumptions!");

    const annual = workbook.getWorksheet("Annual Summary")!;
    expect(typeof annual.getCell("F2").formula).toBe("string");
    expect(annual.getCell("F2").formula).toContain("Monthly!");

    const breakEven = workbook.getWorksheet("Break-even Analysis")!;
    expect(typeof breakEven.getCell("B3").formula).toBe("string");

    // The Assumptions sheet itself is the one place raw, editable values live.
    const assumptions = workbook.getWorksheet("Assumptions")!;
    expect(assumptions.getCell("B2").value).toBe(inputs.purchaseCost);
    expect(assumptions.getCell("B2").formula).toBeUndefined();
  });

  it("never throws for an unreachable break-even (undefined contribution margin)", async () => {
    const lossyInputs: AssessmentInputs = { ...inputs, variableCostPerUse: 10_000 };
    const result = computeAssessment(lossyInputs);
    expect(result.breakEvenUsagePerDay).toBeNull();
    await expect(generateExcelWorkbook(lossyInputs, result)).resolves.toBeInstanceOf(Uint8Array);
  });

  it("never throws for an undefined IRR (all-negative cash flows)", async () => {
    const losingInputs: AssessmentInputs = { ...inputs, fixedCostPerMonth: 10_000_000 };
    const result = computeAssessment(losingInputs);
    expect(result.irr).toBeNull();
    const buffer = await generateExcelWorkbook(losingInputs, result);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(buffer) as any); // eslint-disable-line @typescript-eslint/no-explicit-any -- exceljs's Buffer type vs. workspace @types/node Buffer generic skew, runtime-safe
    const annual = workbook.getWorksheet("Annual Summary")!;
    // IRR row is written as a plain text note, not a formula, when undefined.
    const irrRowLabelCell = annual.getRows(1, 40)!.find((r) => r.getCell("A").value === "IRR")!;
    expect(String(irrRowLabelCell.getCell("B").value)).toMatch(/Undefined/);
  });
});
