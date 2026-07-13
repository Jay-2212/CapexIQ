import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { generateExportZip } from "../../exports/zip-generator";

describe("generateExportZip", () => {
  it("bundles the Excel workbook and Word proposal under SPEC.md §29.2's exact file names", async () => {
    const excel = new Uint8Array([1, 2, 3]);
    const word = new Uint8Array([4, 5, 6, 7]);
    const zipBuffer = await generateExportZip(excel, word);
    expect(zipBuffer.byteLength).toBeGreaterThan(0);

    const zip = await JSZip.loadAsync(zipBuffer);
    expect(Object.keys(zip.files).sort()).toEqual(["Financial Model.xlsx", "Proposal Report.docx"]);

    const excelBack = await zip.file("Financial Model.xlsx")!.async("uint8array");
    const wordBack = await zip.file("Proposal Report.docx")!.async("uint8array");
    expect(Array.from(excelBack)).toEqual([1, 2, 3]);
    expect(Array.from(wordBack)).toEqual([4, 5, 6, 7]);
  });
});
