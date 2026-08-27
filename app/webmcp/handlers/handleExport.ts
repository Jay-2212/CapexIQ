// Handler for WebMCP tool: export_assessment
// Generates Excel (.xlsx), Word (.docx), or bundled ZIP exports using exports/*.ts generators.

import { isResultStateFresh } from "../../forms/wizardValidation";
import { toAssessmentInputs } from "../../forms/toAssessmentInputs";
import { computeAssessment } from "@/formulas/computeAssessment";
import type {
  ExportAssessmentInput,
  ExportAssessmentOutput,
  WebMCPContextAccessor,
  WebMCPResult,
} from "../types";

const CRORE = 10_000_000;
const LAKH = 100_000;

function triggerDownload(bytes: Uint8Array, filename: string, mimeType: string) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const blob = new Blob([bytes.slice()], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function handleExport(
  input: ExportAssessmentInput,
  context?: WebMCPContextAccessor
): Promise<WebMCPResult<ExportAssessmentOutput>> {
  try {
    if (!context || !context.getState) {
      return {
        success: false,
        error: {
          error_code: "WIZARD_CONTEXT_UNAVAILABLE",
          message: "Wizard session context is not available for export.",
          suggested_fix: "Ensure the CapexIQ wizard is open and populated.",
        },
      };
    }

    const state = context.getState();
    if (!isResultStateFresh(state)) {
      return {
        success: false,
        error: {
          error_code: "INCOMPLETE_ASSESSMENT_STATE",
          message: "Cannot generate export because required fields are incomplete or invalid.",
          suggested_fix: "Ensure all required fields up through Step 3 (Costs & Assumptions) are completed.",
        },
      };
    }

    const inputs = toAssessmentInputs(state);
    const result = computeAssessment(inputs);
    const hospitalName = state.preStep.hospitalName || "Hospital";
    const equipmentCategory = state.preStep.equipmentCategory || "Equipment";
    const reportContext = { hospitalName, equipmentCategory };

    const { format = "excel", download = false } = input;

    let fileName = "";
    let mimeType = "";
    let byteLength = 0;

    if (format === "excel") {
      const { generateExcelWorkbook } = await import("@/exports/excel-generator");
      const bytes = await generateExcelWorkbook(inputs, result);
      fileName = `${hospitalName} - ${equipmentCategory} Capex Model.xlsx`;
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      byteLength = bytes.byteLength;
      if (download) {
        triggerDownload(bytes, fileName, mimeType);
      }
    } else if (format === "word") {
      const { generateWordProposal } = await import("@/exports/word-generator");
      const bytes = await generateWordProposal(inputs, result, reportContext);
      fileName = `${hospitalName} - ${equipmentCategory} Board Proposal.docx`;
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      byteLength = bytes.byteLength;
      if (download) {
        triggerDownload(bytes, fileName, mimeType);
      }
    } else if (format === "zip") {
      const [{ generateExcelWorkbook }, { generateWordProposal }, { generateExportZip }] =
        await Promise.all([
          import("@/exports/excel-generator"),
          import("@/exports/word-generator"),
          import("@/exports/zip-generator"),
        ]);
      const [excelBytes, wordBytes] = await Promise.all([
        generateExcelWorkbook(inputs, result),
        generateWordProposal(inputs, result, reportContext),
      ]);
      const zipBytes = await generateExportZip(excelBytes, wordBytes);
      fileName = `${hospitalName} - ${equipmentCategory} CapexIQ Package.zip`;
      mimeType = "application/zip";
      byteLength = zipBytes.byteLength;
      if (download) {
        triggerDownload(zipBytes, fileName, mimeType);
      }
    } else {
      return {
        success: false,
        error: {
          error_code: "INVALID_EXPORT_FORMAT",
          message: `Export format '${format}' is not supported.`,
          suggested_fix: "Specify 'excel', 'word', or 'zip'.",
        },
      };
    }

    return {
      success: true,
      data: {
        format,
        fileName,
        mimeType,
        byteLength,
        downloadTriggered: download && typeof document !== "undefined",
        summary: {
          hospitalName,
          equipmentCategory,
          initialInvestmentCr: Number((result.initialInvestment / CRORE).toFixed(2)),
          paybackYears: Number(result.paybackYears.toFixed(2)),
          npvLakh: Number((result.npv / LAKH).toFixed(2)),
          irrPct: result.irr !== null ? Number(result.irr.toFixed(2)) : null,
        },
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        error_code: "EXPORT_GENERATION_FAILED",
        message: err instanceof Error ? err.message : "Failed to generate report export.",
        suggested_fix: "Retry export generation or check browser permissions.",
      },
    };
  }
}
