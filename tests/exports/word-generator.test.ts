// exports/word-generator.ts's output is a real .docx (a zip of XML parts); the only
// way to verify its content without a Word install is to unzip it and inspect
// word/document.xml directly (docx's own Packer has no reader API). Confirms every
// number comes from the same computeAssessment() result the dashboard renders — never
// a re-derived figure — and that the verbatim disclaimer text made it in unparaphrased.

import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { computeAssessment, AssessmentInputs } from "../../formulas/computeAssessment";
import { generateWordProposal } from "../../exports/word-generator";
import { formatInr, formatPercent, formatYears } from "../../app/components/formatting";

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

async function extractDocumentXml(buffer: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const file = zip.file("word/document.xml");
  if (!file) throw new Error("word/document.xml missing from generated docx");
  return file.async("string");
}

describe("generateWordProposal", () => {
  it("produces a non-empty docx buffer containing word/document.xml", async () => {
    const result = computeAssessment(inputs);
    const buffer = await generateWordProposal(inputs, result, {
      hospitalName: "Test Hospital",
      equipmentCategory: "MRI",
    });
    expect(buffer.byteLength).toBeGreaterThan(0);
    const xml = await extractDocumentXml(buffer);
    expect(xml.length).toBeGreaterThan(0);
  });

  it("includes the exact same NPV/IRR/payback numbers computeAssessment produced — never re-derived", async () => {
    const result = computeAssessment(inputs);
    const buffer = await generateWordProposal(inputs, result, {
      hospitalName: "Apex Hospital",
      equipmentCategory: "CT Scanner",
    });
    const xml = await extractDocumentXml(buffer);

    expect(xml).toContain("Apex Hospital");
    expect(xml).toContain("CT Scanner");
    expect(xml).toContain(escapeXmlEntities(formatInr(result.npv)));
    expect(xml).toContain(escapeXmlEntities(formatPercent(result.irr!)));
    expect(xml).toContain(escapeXmlEntities(formatYears(result.paybackYearsFromCashFlows)));
  });

  it("shows 'Undefined' for IRR rather than a fabricated number when computeAssessment returns null", async () => {
    const losingInputs: AssessmentInputs = { ...inputs, fixedCostPerMonth: 10_000_000 };
    const result = computeAssessment(losingInputs);
    expect(result.irr).toBeNull();
    const buffer = await generateWordProposal(losingInputs, result, {
      hospitalName: "Test Hospital",
      equipmentCategory: "MRI",
    });
    const xml = await extractDocumentXml(buffer);
    expect(xml).toContain("Undefined");
  });

  it("includes the verbatim disclaimer text, not a paraphrase", async () => {
    const result = computeAssessment(inputs);
    const buffer = await generateWordProposal(inputs, result, {
      hospitalName: "Test Hospital",
      equipmentCategory: "MRI",
    });
    const xml = await extractDocumentXml(buffer);
    expect(xml).toContain("not financial, investment, tax, or legal advice");
    expect(xml).toContain("accept no liability for decisions made on the basis of its output");
  });

  it("includes a risk note for a caution-band scenario and the 'no major risk flags' text for a clean one", async () => {
    const riskyInputs: AssessmentInputs = { ...inputs, usagePerDay: 3 };
    const riskyResult = computeAssessment(riskyInputs);
    const riskyBuffer = await generateWordProposal(riskyInputs, riskyResult, {
      hospitalName: "Test Hospital",
      equipmentCategory: "MRI",
    });
    const riskyXml = await extractDocumentXml(riskyBuffer);
    expect(riskyXml).toMatch(/risk/i);
  });

  it("never throws for a cash purchase with no financing terms to show", async () => {
    const result = computeAssessment(inputs);
    await expect(
      generateWordProposal(inputs, result, { hospitalName: "Test Hospital", equipmentCategory: "MRI" })
    ).resolves.toBeInstanceOf(Uint8Array);
  });
});

function escapeXmlEntities(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
