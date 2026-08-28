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

const INR_FORMAT = '₹#,##0;[Red]-₹#,##0';
const PERCENT_FORMAT = '0.0"%"';
const INTEGER_FORMAT = '#,##0';
const DECIMAL_FORMAT = '#,##0.0';
const BODY_FONT = { name: "Aptos", size: 10, color: { argb: "FF263238" } };
const HEADER_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF0F766E" } };
const SECTION_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFD9F0ED" } };
const TITLE_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF164E63" } };
const GRID_BORDER = {
  top: { style: "thin" as const, color: { argb: "FFD7DEE2" } },
  left: { style: "thin" as const, color: { argb: "FFD7DEE2" } },
  bottom: { style: "thin" as const, color: { argb: "FFD7DEE2" } },
  right: { style: "thin" as const, color: { argb: "FFD7DEE2" } },
};

function styleTitle(sheet: ExcelJS.Worksheet, endColumn: number): void {
  const row = sheet.getRow(1);
  row.height = 28;
  for (let column = 1; column <= endColumn; column += 1) {
    const cell = row.getCell(column);
    cell.font = { ...BODY_FONT, bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    cell.fill = TITLE_FILL;
    cell.alignment = { vertical: "middle", wrapText: true };
  }
}

function styleHeader(sheet: ExcelJS.Worksheet, rowNumber: number, endColumn: number): void {
  const row = sheet.getRow(rowNumber);
  row.height = 34;
  for (let column = 1; column <= endColumn; column += 1) {
    const cell = row.getCell(column);
    cell.font = { ...BODY_FONT, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = HEADER_FILL;
    cell.border = GRID_BORDER;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  }
}

function styleSection(sheet: ExcelJS.Worksheet, rowNumber: number, endColumn: number): void {
  const row = sheet.getRow(rowNumber);
  row.height = 22;
  for (let column = 1; column <= endColumn; column += 1) {
    const cell = row.getCell(column);
    cell.font = { ...BODY_FONT, bold: true, color: { argb: "FF164E63" } };
    cell.fill = SECTION_FILL;
    cell.border = GRID_BORDER;
    cell.alignment = { vertical: "middle", wrapText: true };
  }
}

function styleBody(sheet: ExcelJS.Worksheet, endRow: number, endColumn: number): void {
  for (let rowNumber = 1; rowNumber <= endRow; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    if (row.height === undefined) row.height = 19;
    for (let column = 1; column <= endColumn; column += 1) {
      const cell = row.getCell(column);
      if (!cell.font || cell.font.name === undefined) cell.font = BODY_FONT;
      cell.border = GRID_BORDER;
      cell.alignment = {
        ...cell.alignment,
        vertical: "middle",
        wrapText: typeof cell.value === "string" && cell.value.length > 24,
      };
    }
  }
}

function setFormat(
  sheet: ExcelJS.Worksheet,
  column: number,
  startRow: number,
  endRow: number,
  format: string
): void {
  for (let row = startRow; row <= endRow; row += 1) {
    sheet.getCell(row, column).numFmt = format;
  }
}

function findRows(sheet: ExcelJS.Worksheet, predicate: (value: unknown) => boolean): number[] {
  const rows: number[] = [];
  for (let row = 1; row <= sheet.rowCount; row += 1) {
    if (predicate(sheet.getCell(row, 1).value)) rows.push(row);
  }
  return rows;
}

function applyCommonPageSetup(
  sheet: ExcelJS.Worksheet,
  printArea: string,
  orientation: "portrait" | "landscape",
  printTitlesRow = "1:1"
): void {
  sheet.views = [{ state: "frozen", ySplit: 1, topLeftCell: "A2", showGridLines: false }];
  sheet.pageSetup = {
    ...sheet.pageSetup,
    orientation,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printArea,
    printTitlesRow,
    margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    horizontalCentered: false,
  };
  sheet.headerFooter = {
    ...sheet.headerFooter,
    oddFooter: "CapexIQ  •  Page &P of &N",
  };
}

function formatWorkbook(sheets: Map<string, ExcelJS.Worksheet>): void {
  const assumptions = sheets.get("Assumptions");
  if (assumptions) {
    const lastRow = assumptions.lastRow?.number ?? 1;
    styleBody(assumptions, lastRow, 5);
    styleTitle(assumptions, 5);
    const payerHeader = findRows(assumptions, (value) => value === "Payer")[0];
    if (payerHeader) styleHeader(assumptions, payerHeader, 5);
    findRows(assumptions, (value) => value === "Payer mix" || (typeof value === "string" && value.startsWith("Maintenance overrides")))
      .forEach((row) => styleSection(assumptions, row, 5));

    const currencyLabels = new Set([
      "Purchase cost",
      "Installation cost",
      "Initial investment",
      "Variable cost per use",
      "Fixed cost per month",
      "Loan down payment",
      "Lease rental per month",
      "CMC annual cost",
      "AMC annual cost",
      "Billed per use (weighted)",
      "Realized revenue per use",
    ]);
    for (let row = 2; row <= lastRow; row += 1) {
      const label = assumptions.getCell(row, 1).value;
      if (typeof label === "string" && currencyLabels.has(label)) assumptions.getCell(row, 2).numFmt = INR_FORMAT;
      if (label === "Discount rate (%)" || label === "Salvage value (%)" || (typeof label === "string" && label.startsWith("Ramp:"))) {
        assumptions.getCell(row, 2).numFmt = PERCENT_FORMAT;
      }
      if (label === "Usage per day" || label === "Working days per month" || label === "Useful life (years)" || label === "Loan/lease tenure (months)" || label === "Warranty years" || label === "CMC years") {
        assumptions.getCell(row, 2).numFmt = INTEGER_FORMAT;
      }
    }
    if (payerHeader) {
      const payerStart = payerHeader + 1;
      const payerEnd = payerStart + 4;
      setFormat(assumptions, 2, payerStart, payerEnd, PERCENT_FORMAT);
      setFormat(assumptions, 3, payerStart, payerEnd, INR_FORMAT);
      setFormat(assumptions, 4, payerStart, payerEnd, PERCENT_FORMAT);
      setFormat(assumptions, 5, payerStart, payerEnd, INTEGER_FORMAT);
    }
    findRows(assumptions, (value) => typeof value === "string" && value.endsWith("override"))
      .forEach((row) => assumptions.getCell(row, 2).numFmt = PERCENT_FORMAT);
    assumptions.getColumn(1).width = 42;
    assumptions.getColumn(2).width = 20;
    assumptions.getColumn(3).width = 20;
    assumptions.getColumn(4).width = 28;
    assumptions.getColumn(5).width = 22;
    applyCommonPageSetup(assumptions, `A1:E${lastRow}`, "portrait");
    assumptions.autoFilter = payerHeader ? `A${payerHeader}:E${payerHeader + 5}` : undefined;
  }

  const monthly = sheets.get("Monthly");
  if (monthly) {
    const lastRow = monthly.lastRow?.number ?? 1;
    styleBody(monthly, lastRow, 19);
    styleHeader(monthly, 1, 16);
    setFormat(monthly, 1, 2, lastRow, INTEGER_FORMAT);
    setFormat(monthly, 2, 2, lastRow, INTEGER_FORMAT);
    setFormat(monthly, 4, 2, lastRow, PERCENT_FORMAT);
    [3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].forEach((column) => setFormat(monthly, column, 2, lastRow, INR_FORMAT));
    monthly.getCell("S1").numFmt = INR_FORMAT;
    monthly.getColumn(1).width = 10;
    monthly.getColumn(2).width = 10;
    for (let column = 3; column <= 10; column += 1) monthly.getColumn(column).width = 19;
    for (let column = 11; column <= 16; column += 1) monthly.getColumn(column).width = 23;
    monthly.getColumn(18).width = 26;
    monthly.getColumn(19).width = 18;
    applyCommonPageSetup(monthly, `A1:P${lastRow}`, "landscape");
    monthly.autoFilter = `A1:P${lastRow}`;
  }

  const annual = sheets.get("Annual Summary");
  if (annual) {
    const lastRow = annual.lastRow?.number ?? 1;
    styleBody(annual, lastRow, 21);
    styleHeader(annual, 1, 7);
    setFormat(annual, 1, 2, lastRow, INTEGER_FORMAT);
    for (let column = 2; column <= 7; column += 1) setFormat(annual, column, 2, lastRow, INR_FORMAT);
    const irrRow = findRows(annual, (value) => value === "IRR")[0];
    if (irrRow) annual.getCell(irrRow, 2).numFmt = PERCENT_FORMAT;
    for (let column = 8; column <= 21; column += 1) {
      annual.getColumn(column).hidden = true;
      setFormat(annual, column, 1, lastRow, INR_FORMAT);
    }
    for (let column = 1; column <= 7; column += 1) annual.getColumn(column).width = column === 1 ? 10 : 24;
    applyCommonPageSetup(annual, `A1:G${lastRow}`, "landscape");
    annual.autoFilter = `A1:G${Math.max(1, (irrRow ?? lastRow) - 2)}`;
  }

  const breakEven = sheets.get("Break-even Analysis");
  if (breakEven) {
    const lastRow = breakEven.lastRow?.number ?? 1;
    styleBody(breakEven, lastRow, 2);
    styleHeader(breakEven, 1, 2);
    breakEven.getCell("B1").numFmt = INR_FORMAT;
    breakEven.getCell("B2").numFmt = DECIMAL_FORMAT;
    breakEven.getCell("B3").numFmt = DECIMAL_FORMAT;
    breakEven.getColumn(1).width = 38;
    breakEven.getColumn(2).width = 32;
    applyCommonPageSetup(breakEven, `A1:B${lastRow}`, "portrait");
  }

  const maintenance = sheets.get("Maintenance Schedule");
  if (maintenance) {
    const lastRow = maintenance.lastRow?.number ?? 1;
    styleBody(maintenance, lastRow, 3);
    styleHeader(maintenance, 1, 3);
    setFormat(maintenance, 1, 2, lastRow, INTEGER_FORMAT);
    setFormat(maintenance, 3, 2, lastRow, INR_FORMAT);
    maintenance.getColumn(1).width = 10;
    maintenance.getColumn(2).width = 18;
    maintenance.getColumn(3).width = 22;
    applyCommonPageSetup(maintenance, `A1:C${lastRow}`, "portrait");
  }

  const charts = sheets.get("Charts");
  if (charts) {
    const lastRow = charts.lastRow?.number ?? 1;
    styleBody(charts, lastRow, 5);
    styleHeader(charts, 1, 5);
    setFormat(charts, 1, 2, lastRow, INTEGER_FORMAT);
    setFormat(charts, 2, 2, lastRow, INR_FORMAT);
    setFormat(charts, 4, 2, lastRow, DECIMAL_FORMAT);
    setFormat(charts, 5, 2, lastRow, DECIMAL_FORMAT);
    charts.getColumn(1).width = 10;
    charts.getColumn(2).width = 26;
    charts.getColumn(3).width = 4;
    charts.getColumn(4).width = 24;
    charts.getColumn(5).width = 26;
    applyCommonPageSetup(charts, `A1:E${lastRow}`, "portrait");
  }

  const notes = sheets.get("Formula Notes");
  if (notes) {
    const lastRow = notes.lastRow?.number ?? 1;
    styleBody(notes, lastRow, 2);
    styleHeader(notes, 1, 2);
    notes.getColumn(1).width = 34;
    notes.getColumn(2).width = 96;
    for (let row = 2; row <= lastRow; row += 1) notes.getRow(row).height = 42;
    applyCommonPageSetup(notes, `A1:B${lastRow}`, "portrait");
  }
}

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

  formatWorkbook(sheets);

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
