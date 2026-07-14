// SPEC.md §29.2's ZIP package: Financial Model.xlsx + Proposal Report.docx. No
// Charts/ folder or Assumptions Summary.pdf this phase — see
// report-templates/excel-sheet-structure.md's Tab 6 note (chart images deferred) and
// SPEC.md §29.2's own "optional later" on the PDF.

import JSZip from "jszip";

export async function generateExportZip(
  excelWorkbook: Uint8Array,
  wordProposal: Uint8Array
): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file("Financial Model.xlsx", excelWorkbook);
  zip.file("Proposal Report.docx", wordProposal);
  const buffer = await zip.generateAsync({ type: "uint8array" });
  return buffer;
}
