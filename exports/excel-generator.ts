// SPEC.md §29 / Phase 8. Writes exports/workbookPlan.ts's plan into a real .xlsx via
// exceljs — the plan itself is the tested artifact (tests/exports/workbookPlan.test.ts
// evaluates every formula cell through HyperFormula and checks it against
// computeAssessment()/buildMonthlySeries()'s own numbers); this file's only job is a
// mechanical write of that already-verified plan, so it stays intentionally thin.
//
// No native Excel chart objects and no rasterized chart images this phase — see
// report-templates/excel-sheet-structure.md's Tab 6 note (deferred, not dropped).

import ExcelJS from "exceljs";
import type { AssessmentInputs, AssessmentResult } from "../formulas/computeAssessment";
import { buildMonthlySeries } from "../formulas/monthlySeries";
import { buildWorkbookPlan } from "./workbookPlan";

export async function generateExcelWorkbook(
  inputs: AssessmentInputs,
  result: AssessmentResult
): Promise<Uint8Array> {
  const monthly = buildMonthlySeries(inputs);
  const plan = buildWorkbookPlan(inputs, result, monthly);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CapexIQ";
  workbook.created = new Date();

  const sheets = new Map<string, ExcelJS.Worksheet>();
  for (const name of plan.sheetOrder) {
    sheets.set(name, workbook.addWorksheet(name));
  }

  for (const cell of plan.cells) {
    const sheet = sheets.get(cell.sheet);
    if (!sheet) continue;
    const target = sheet.getCell(cell.address);
    if (cell.formula !== undefined) {
      target.value = { formula: cell.formula } as ExcelJS.CellFormulaValue;
    } else {
      target.value = cell.value ?? null;
    }
  }

  for (const sheet of sheets.values()) {
    sheet.getColumn(1).width = 26;
    for (let col = 2; col <= 16; col += 1) sheet.getColumn(col).width = 16;
    sheet.getRow(1).font = { bold: true };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
