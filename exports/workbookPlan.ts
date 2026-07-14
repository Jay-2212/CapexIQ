// Pure, exceljs-independent plan for Financial Model.xlsx — see
// report-templates/excel-sheet-structure.md for the tab-by-tab contract this builds
// against. Kept separate from exports/excel-generator.ts so the plan itself (every
// cell, every formula string) can be fed straight into a HyperFormula test oracle and
// checked cell-by-cell against computeAssessment()/buildMonthlySeries() output,
// without needing exceljs or a real xlsx round-trip to verify correctness.
//
// Every formula here is transcribed from report-templates/formula-appendix.md — no
// arithmetic is invented; where Excel has a native equivalent of a /formulas function
// (PMT, NPV, IRR) that native function is used, matching that function's own
// semantics exactly (see the spike that proved PMT/NPV/IRR/SUMPRODUCT/INDEX/CEILING/
// ROUNDUP all evaluate correctly via HyperFormula before this file was written).
//
// Cell references are direct addresses (e.g. "Assumptions!$B$4"), not Excel defined
// names — a defined-name resolution failure shows as a silent #NAME? throughout the
// workbook with nothing in this headless pipeline able to catch it, whereas a direct
// reference is exactly what the Phase 8 spike proved round-trips through exceljs, and
// still lets a reader use Excel's own "trace precedents" to reach the Assumptions
// sheet (the DoD's actual requirement).

import type { AssessmentInputs, AssessmentResult } from "../formulas/computeAssessment";
import type { MonthlySeries } from "../formulas/monthlySeries";

export interface CellPlan {
  sheet: string;
  address: string;
  value?: number | string;
  formula?: string;
}

export interface WorkbookPlan {
  sheetOrder: string[];
  cells: CellPlan[];
  /** Addresses of interest, for tests and for the generator's column-header pass. */
  refs: {
    npv: string;
    irr: string | null;
    breakEvenUsagePerDay: string;
    expectedUsagePerDay: string;
    monthlyNetCashFlowRange: { sheet: string; firstRow: number; lastRow: number; col: string };
    annualNetCashFlowRange: { sheet: string; firstRow: number; lastRow: number; col: string };
    annualCumulativeCashPosition: { sheet: string; firstRow: number; lastRow: number; col: string };
  };
}

function colLetter(n: number): string {
  let s = "";
  let x = n;
  while (x > 0) {
    const rem = (x - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

const PAYER_LABELS = ["Private cash", "Insurance / TPA", "Corporate credit", "PM-JAY / government", "Other"];

export function buildWorkbookPlan(
  inputs: AssessmentInputs,
  result: AssessmentResult,
  monthly: MonthlySeries
): WorkbookPlan {
  const cells: CellPlan[] = [];
  const push = (sheet: string, address: string, entry: { value?: number | string; formula?: string }) => {
    cells.push({ sheet, address, ...entry });
  };

  // ---------------------------------------------------------------- Assumptions ---
  const A = "Assumptions";
  let row = 1;
  const addRow = (label: string, value: number | string): string => {
    row += 1;
    push(A, `A${row}`, { value: label });
    push(A, `B${row}`, { value });
    return `${A}!$B$${row}`;
  };

  push(A, "A1", { value: "CapexIQ — Assumptions" });

  const purchaseCostRef = addRow("Purchase cost", inputs.purchaseCost);
  const installationCostRef = addRow("Installation cost", inputs.installationCost);
  row += 1;
  push(A, `A${row}`, { value: "Initial investment" });
  push(A, `B${row}`, { formula: `${purchaseCostRef.replace(`${A}!`, "")}+${installationCostRef.replace(`${A}!`, "")}` });
  const initialInvestmentRef = `${A}!$B$${row}`;

  const usagePerDayRef = addRow("Usage per day", inputs.usagePerDay);
  const workingDaysRef = addRow("Working days per month", inputs.workingDaysPerMonth);
  const variableCostPerUseRef = addRow("Variable cost per use", inputs.variableCostPerUse);
  const fixedCostPerMonthRef = addRow("Fixed cost per month", inputs.fixedCostPerMonth);
  const usefulLifeYearsRef = addRow("Useful life (years)", inputs.usefulLifeYears);
  const discountRateRef = addRow("Discount rate (%)", inputs.discountRate);
  addRow("Salvage value (%)", inputs.salvageValuePercentage);

  const financingTypeLabel =
    inputs.financing.type === "cash" ? "Cash" : inputs.financing.type === "loan" ? "Loan" : "Lease";
  const financingTypeRef = addRow("Financing type", financingTypeLabel);
  const loanDownPaymentRef = addRow(
    "Loan down payment",
    inputs.financing.type === "loan" ? inputs.financing.downPayment : 0
  );
  const loanInterestRateRef = addRow(
    "Loan interest rate (%)",
    inputs.financing.type === "loan" ? inputs.financing.interestRate : 0
  );
  const tenureMonthsRef = addRow(
    "Loan/lease tenure (months)",
    inputs.financing.type === "cash" ? 0 : inputs.financing.tenureMonths
  );
  const leaseRentalRef = addRow(
    "Lease rental per month",
    inputs.financing.type === "lease" ? inputs.financing.rentalPerMonth : 0
  );

  const warrantyYearsRef = addRow("Warranty years", inputs.maintenance.warrantyYears);
  const cmcYearsRef = addRow("CMC years", inputs.maintenance.cmcYears);
  const cmcAnnualCostRef = addRow("CMC annual cost", inputs.maintenance.cmcAnnualCost);
  const amcAnnualCostRef = addRow("AMC annual cost", inputs.maintenance.amcAnnualCost);

  const ramp = inputs.utilizationRamp;
  const rampMonth1to3Ref = addRow("Ramp: months 1-3 (%)", ramp?.month1to3Pct ?? 100);
  const rampMonth4to6Ref = addRow("Ramp: months 4-6 (%)", ramp?.month4to6Pct ?? 100);
  const rampMonth7to12Ref = addRow("Ramp: months 7-12 (%)", ramp?.month7to12Pct ?? 100);
  const rampYear2PlusRef = addRow("Ramp: year 2+ (%)", ramp?.year2PlusPct ?? 100);

  row += 1;
  push(A, `A${row}`, { value: "Payer mix" });
  row += 1;
  push(A, `A${row}`, { value: "Payer" });
  push(A, `B${row}`, { value: "Share of volume %" });
  push(A, `C${row}`, { value: "Billed tariff (₹)" });
  push(A, `D${row}`, { value: "Realization % (post-deduction)" });
  push(A, `E${row}`, { value: "Collection delay (days)" });
  const payerFirstDataRow = row + 1;
  inputs.payerMix.forEach((payer, index) => {
    row += 1;
    push(A, `A${row}`, { value: PAYER_LABELS[index] ?? payer.payerName });
    push(A, `B${row}`, { value: payer.shareOfVolume });
    push(A, `C${row}`, { value: payer.billedTariff });
    push(A, `D${row}`, { value: payer.realizationPercentage });
    push(A, `E${row}`, { value: payer.collectionDelayDays });
  });
  const payerLastDataRow = row;

  row += 1;
  push(A, `A${row}`, { value: "Billed per use (weighted)" });
  push(
    A,
    `B${row}`,
    {
      formula: `SUMPRODUCT($B$${payerFirstDataRow}:$B$${payerLastDataRow},$C$${payerFirstDataRow}:$C$${payerLastDataRow})/100`,
    }
  );
  const billedPerUseWeightedRef = `${A}!$B$${row}`;

  row += 1;
  push(A, `A${row}`, { value: "Realized revenue per use" });
  push(
    A,
    `B${row}`,
    {
      formula: `SUMPRODUCT($B$${payerFirstDataRow}:$B$${payerLastDataRow},$C$${payerFirstDataRow}:$C$${payerLastDataRow},$D$${payerFirstDataRow}:$D$${payerLastDataRow})/10000`,
    }
  );
  const realizedPerUseRef = `${A}!$B$${row}`;

  // Per-year maintenance override (ISS-19, `inputs.maintenance.costByYearPct`) — a
  // real, UI-reachable Advanced-mode override (`app/advanced/
  // MaintenanceScheduleFields.tsx`) that both `computeAssessment.ts` and
  // `formulas/monthlySeries.ts` apply. Missing from the Excel model's Monthly/
  // Maintenance-Schedule formulas would silently disagree with the dashboard's own
  // NPV/IRR for any user who sets one — caught by an advisor review before ship,
  // not discovered live. Blank ("") means "no override, use the standard ladder,"
  // matching the null/undefined convention in `AssessmentMaintenance.costByYearPct`.
  row += 1;
  push(A, `A${row}`, { value: "Maintenance overrides (%, blank = use standard schedule)" });
  const overrideFirstRow = row + 1;
  for (let y = 0; y < inputs.usefulLifeYears; y += 1) {
    row += 1;
    const overridePct = inputs.maintenance.costByYearPct?.[y];
    push(A, `A${row}`, { value: `Year ${y + 1} override` });
    push(A, `B${row}`, { value: overridePct === null || overridePct === undefined ? "" : overridePct });
  }
  const overrideLastRow = row;

  // -------------------------------------------------------------------- Monthly ---
  const M = "Monthly";
  const totalMonths = inputs.usefulLifeYears * 12;
  const monthlySheetRows = monthly.monthlyCashReceived.length;
  const headerRow = 1;
  const firstDataRow = 2;
  const lastDataRow = headerRow + monthlySheetRows;

  const headers = [
    "Month #",
    "Year #",
    "Billed revenue",
    "Ramp %",
    "Realized revenue",
    "Variable cost",
    "Fixed cost",
    "Maintenance cost",
    "EMI / lease",
    "Net cash flow after financing",
    `Cash received — ${PAYER_LABELS[0]}`,
    `Cash received — ${PAYER_LABELS[1]}`,
    `Cash received — ${PAYER_LABELS[2]}`,
    `Cash received — ${PAYER_LABELS[3]}`,
    `Cash received — ${PAYER_LABELS[4]}`,
    "Cash received — Total",
  ];
  headers.forEach((label, index) => push(M, `${colLetter(index + 1)}${headerRow}`, { value: label }));

  push(M, "R1", { value: "Monthly payment (EMI/lease)" });
  push(M, "S1", {
    formula:
      `IF(${financingTypeRef}="Loan",` +
      `-PMT(${loanInterestRateRef}/12/100,${tenureMonthsRef},${initialInvestmentRef}-${loanDownPaymentRef}),` +
      `IF(${financingTypeRef}="Lease",${leaseRentalRef},0))`,
  });
  const monthlyPaymentRef = `${M}!$S$1`;

  const COL = {
    month: "A",
    year: "B",
    billed: "C",
    ramp: "D",
    realized: "E",
    variable: "F",
    fixed: "G",
    maintenance: "H",
    emi: "I",
    net: "J",
    cr1: "K",
    cr2: "L",
    cr3: "M",
    cr4: "N",
    cr5: "O",
    crTotal: "P",
  };
  const crCols = [COL.cr1, COL.cr2, COL.cr3, COL.cr4, COL.cr5];

  for (let i = 0; i < monthlySheetRows; i += 1) {
    const r = firstDataRow + i;
    const monthNumber = i + 1;
    push(M, `${COL.month}${r}`, { value: monthNumber });

    if (monthNumber <= totalMonths) {
      const yearNumber = Math.ceil(monthNumber / 12);
      push(M, `${COL.year}${r}`, { value: yearNumber });
      push(M, `${COL.ramp}${r}`, {
        formula: `IF(${COL.month}${r}<=3,${rampMonth1to3Ref},IF(${COL.month}${r}<=6,${rampMonth4to6Ref},IF(${COL.month}${r}<=12,${rampMonth7to12Ref},${rampYear2PlusRef})))/100`,
      });
      push(M, `${COL.billed}${r}`, {
        // ISS-29 (Jay's decision, 2026-07-14): billed revenue ramps with the same
        // utilization curve as realized revenue below — both are usagePerDay-driven,
        // differing only in per-use rate, so a volume ramp affects both identically.
        formula: `${usagePerDayRef}*${billedPerUseWeightedRef}*${workingDaysRef}*${COL.ramp}${r}`,
      });
      push(M, `${COL.realized}${r}`, {
        formula: `${usagePerDayRef}*${realizedPerUseRef}*${workingDaysRef}*${COL.ramp}${r}`,
      });
      push(M, `${COL.variable}${r}`, {
        formula: `${usagePerDayRef}*${variableCostPerUseRef}*${workingDaysRef}*${COL.ramp}${r}`,
      });
      push(M, `${COL.fixed}${r}`, { formula: `${fixedCostPerMonthRef}` });
      {
        const overrideLookup = `INDEX(${A}!$B$${overrideFirstRow}:$B$${overrideLastRow},${COL.year}${r})`;
        push(M, `${COL.maintenance}${r}`, {
          formula:
            `IF(${overrideLookup}<>"",${overrideLookup}/100*${purchaseCostRef},` +
            `IF(${COL.year}${r}<=${warrantyYearsRef},0,IF(${COL.year}${r}<=${warrantyYearsRef}+${cmcYearsRef},${cmcAnnualCostRef},${amcAnnualCostRef})))/12`,
        });
      }
      push(M, `${COL.emi}${r}`, {
        formula: `IF(${financingTypeRef}="Cash",0,IF(${COL.month}${r}<=${tenureMonthsRef},${monthlyPaymentRef},0))`,
      });
      push(M, `${COL.net}${r}`, {
        formula: `${COL.realized}${r}-${COL.variable}${r}-${COL.fixed}${r}-${COL.maintenance}${r}-${COL.emi}${r}`,
      });
    }

    for (let p = 0; p < 5; p += 1) {
      const payerShareAddr = `${A}!$B$${payerFirstDataRow + p}`;
      const payerDelayAddr = `${A}!$E$${payerFirstDataRow + p}`;
      const offsetExpr = `CEILING(${payerDelayAddr}/30,1)`;
      const sourceMonthExpr = `${COL.month}${r}-${offsetExpr}`;
      // Both bounds matter here, not just the lower one: for a payer with a short
      // (or zero) collection delay, a "tail" row past the useful-life horizon would
      // otherwise compute a source-month index beyond the Realized-revenue range's
      // last row, which INDEX() rejects as #NUM! ("value too large") rather than
      // silently returning blank — caught by tests/exports/workbookPlan.test.ts's
      // golden scenario B (financed + DSO) before this upper bound was added.
      push(M, `${crCols[p]}${r}`, {
        formula:
          `IF(AND(${sourceMonthExpr}>=1,${sourceMonthExpr}<=${totalMonths}),` +
          `INDEX($${COL.realized}$${firstDataRow}:$${COL.realized}$${firstDataRow + totalMonths - 1},${sourceMonthExpr})*${payerShareAddr}/100,0)`,
      });
    }
    push(M, `${COL.crTotal}${r}`, {
      formula: `${crCols.map((c) => `${c}${r}`).join("+")}`,
    });
  }

  // ---------------------------------------------------------------- Annual Summary
  const S = "Annual Summary";
  push(S, "A1", { value: "Year" });
  push(S, "B1", { value: "Billed revenue" });
  push(S, "C1", { value: "Realized revenue" });
  push(S, "D1", { value: "Operating cost" });
  push(S, "E1", { value: "EMI / lease" });
  push(S, "F1", { value: "Net cash flow after financing" });
  push(S, "G1", { value: "Cumulative cash position" });

  for (let y = 0; y < inputs.usefulLifeYears; y += 1) {
    const r = 2 + y;
    const monthStart = firstDataRow + y * 12;
    const monthEnd = monthStart + 11;
    push(S, `A${r}`, { value: y + 1 });
    push(S, `B${r}`, { formula: `SUM(${M}!$${COL.billed}$${monthStart}:$${COL.billed}$${monthEnd})` });
    push(S, `C${r}`, { formula: `SUM(${M}!$${COL.realized}$${monthStart}:$${COL.realized}$${monthEnd})` });
    push(S, `D${r}`, {
      formula: `SUM(${M}!$${COL.variable}$${monthStart}:$${COL.variable}$${monthEnd})+SUM(${M}!$${COL.fixed}$${monthStart}:$${COL.fixed}$${monthEnd})+SUM(${M}!$${COL.maintenance}$${monthStart}:$${COL.maintenance}$${monthEnd})`,
    });
    push(S, `E${r}`, { formula: `SUM(${M}!$${COL.emi}$${monthStart}:$${COL.emi}$${monthEnd})` });
    push(S, `F${r}`, { formula: `SUM(${M}!$${COL.net}$${monthStart}:$${COL.net}$${monthEnd})` });
    push(S, `G${r}`, {
      formula: y === 0 ? `F${r}-${initialInvestmentRef}` : `G${r - 1}+F${r}`,
    });
  }

  const annualFirstRow = 2;
  const annualLastRow = 1 + inputs.usefulLifeYears;
  const npvRow = annualLastRow + 2;
  push(S, `A${npvRow}`, { value: "NPV" });
  push(S, `B${npvRow}`, {
    formula: `NPV(${discountRateRef}/100,F${annualFirstRow}:F${annualLastRow})-${initialInvestmentRef}`,
  });
  const npvAddr = `${S}!$B$${npvRow}`;

  const irrRow = npvRow + 1;
  push(S, `A${irrRow}`, { value: "IRR" });
  let irrAddr: string | null = null;
  if (result.irr === null) {
    push(S, `B${irrRow}`, { value: "Undefined — no discount rate makes NPV cross zero" });
  } else {
    // Excel's IRR() needs one contiguous range including the initial outflow — build
    // a same-row helper array (column H onward, unused elsewhere on this sheet)
    // rather than a discontiguous range.
    push(S, `H${irrRow}`, { formula: `-${initialInvestmentRef}` });
    for (let y = 0; y < inputs.usefulLifeYears; y += 1) {
      push(S, `${colLetter(8 + 1 + y)}${irrRow}`, { formula: `F${annualFirstRow + y}` });
    }
    const lastCol = colLetter(8 + inputs.usefulLifeYears);
    push(S, `B${irrRow}`, { formula: `IRR($H$${irrRow}:$${lastCol}$${irrRow})` });
    irrAddr = `${S}!$B$${irrRow}`;
  }

  // ------------------------------------------------------------ Break-even Analysis
  // Sheet name has a space, so any cross-sheet formula referencing it must be quoted
  // ('Break-even Analysis'!$B$1) — but formulas *within this sheet itself* must use
  // bare addresses with no sheet prefix at all (an unquoted "Break-even Analysis!"
  // prefix is a parse error). Two address forms are kept for exactly this reason:
  // the bare form for same-sheet formulas below, the quoted full form (`refs.*`) for
  // the Charts sheet's cross-sheet references and for external callers/tests.
  const B = "Break-even Analysis";
  push(B, "A1", { value: "Contribution per use" });
  push(B, "B1", { formula: `${realizedPerUseRef}-${variableCostPerUseRef}` });
  const contributionBare = "$B$1";
  push(B, "A2", { value: "Expected usage per day" });
  push(B, "B2", { formula: `${usagePerDayRef}` });
  const expectedUsageBare = "$B$2";
  push(B, "A3", { value: "Break-even usage per day" });
  push(B, "B3", {
    formula: `IF(${contributionBare}<=0,"Undefined — contribution margin is zero or negative",${fixedCostPerMonthRef}/${contributionBare}/${workingDaysRef})`,
  });
  const breakEvenBare = "$B$3";
  push(B, "A4", { value: "Clears break-even" });
  push(B, "B4", { formula: `IF(ISNUMBER(${breakEvenBare}),${expectedUsageBare}>=${breakEvenBare},"N/A")` });
  const breakEvenRef = `'${B}'!$B$3`;
  const expectedUsageRef = `'${B}'!$B$2`;

  // -------------------------------------------------------------- Maintenance Sched
  const MS = "Maintenance Schedule";
  push(MS, "A1", { value: "Year" });
  push(MS, "B1", { value: "Coverage" });
  push(MS, "C1", { value: "Annual cost" });
  for (let y = 1; y <= inputs.usefulLifeYears; y += 1) {
    const r = 1 + y;
    const overrideCell = `${A}!$B$${overrideFirstRow + y - 1}`;
    push(MS, `A${r}`, { value: y });
    push(MS, `B${r}`, {
      formula: `IF(${overrideCell}<>"","Override",IF(${y}<=${warrantyYearsRef},"Warranty",IF(${y}<=${warrantyYearsRef}+${cmcYearsRef},"CMC","AMC")))`,
    });
    push(MS, `C${r}`, {
      formula:
        `IF(${overrideCell}<>"",${overrideCell}/100*${purchaseCostRef},` +
        `IF(${y}<=${warrantyYearsRef},0,IF(${y}<=${warrantyYearsRef}+${cmcYearsRef},${cmcAnnualCostRef},${amcAnnualCostRef})))`,
    });
  }

  // ----------------------------------------------------------------- Charts (data)
  const C = "Charts";
  push(C, "A1", { value: "Year" });
  push(C, "B1", { value: "Cumulative cash position" });
  for (let y = 0; y < inputs.usefulLifeYears; y += 1) {
    push(C, `A${y + 2}`, { value: y + 1 });
    push(C, `B${y + 2}`, { formula: `'${S}'!G${2 + y}` });
  }
  push(C, "D1", { value: "Expected usage per day" });
  push(C, "D2", { formula: `'${B}'!B2` });
  push(C, "E1", { value: "Break-even usage per day" });
  push(C, "E2", { formula: `'${B}'!B3` });

  // --------------------------------------------------------------- Formula Notes ---
  const F = "Formula Notes";
  const notes: [string, string][] = [
    ["Billed monthly revenue", "Usage per day x Average billed revenue per use x Working days per month x Ramp % (same ramp as realized revenue)"],
    ["Realized revenue per use", "Volume-weighted average across payer types of (share % x tariff x realization %)"],
    ["Contribution per use", "Realized revenue per use - Variable cost per use"],
    ["Break-even usage per day", "Fixed monthly cost / Contribution per use / Working days per month"],
    ["Maintenance schedule", "Warranty (0 cost) -> CMC (flat annual cost) -> AMC (flat annual cost), by year"],
    ["EMI (loan)", "Standard amortizing-loan formula; Excel's native PMT function"],
    ["NPV", "Sum of discounted cash flows minus the initial investment; Excel's native NPV function"],
    ["IRR", "The discount rate at which NPV = 0; Excel's native IRR function"],
    ["Cash received by month", "Each payer's share of a month's realized revenue collected ceil(days-to-collect / 30) months later"],
  ];
  push(F, "A1", { value: "Formula" });
  push(F, "B1", { value: "Description" });
  notes.forEach(([name, desc], i) => {
    push(F, `A${i + 2}`, { value: name });
    push(F, `B${i + 2}`, { value: desc });
  });

  return {
    sheetOrder: [A, M, S, B, MS, C, F],
    cells,
    refs: {
      npv: npvAddr,
      irr: irrAddr,
      breakEvenUsagePerDay: breakEvenRef,
      expectedUsagePerDay: expectedUsageRef,
      monthlyNetCashFlowRange: { sheet: M, firstRow: firstDataRow, lastRow: firstDataRow + totalMonths - 1, col: COL.net },
      annualNetCashFlowRange: { sheet: S, firstRow: annualFirstRow, lastRow: annualLastRow, col: "F" },
      annualCumulativeCashPosition: { sheet: S, firstRow: annualFirstRow, lastRow: annualLastRow, col: "G" },
    },
  };
}
