"use client";

import { useWizard } from "../../../forms/WizardContext";
import { NumberField } from "../../../components/NumberField";
import { ProgressStepper } from "../../../components/ProgressStepper";
import { PreviewStrip } from "../../../components/PreviewStrip";
import { StepNav } from "../../../components/StepNav";
import { isStepComplete } from "../../../forms/wizardValidation";
import { AdvancedPanel } from "../../../advanced/AdvancedPanel";

export default function CostsStepPage() {
  const { state } = useWizard();

  return (
    <div className="assess-page">
      <ProgressStepper current="costs" />
      <PreviewStrip />
      <section className="narrative-intro narrative-intro--compact">
        <span className="narrative-intro__eyebrow">03 · The cost to operate</span>
        <h1 tabIndex={-1}>What does a normal month look like?</h1>
        <p>We’ve grouped the costs by how they behave, so you can answer from a vendor quote, payroll plan, or operating estimate.</p>
      </section>

      <section className="question-card question-card--sectioned">
        <div className="question-section">
          <div className="question-section__heading"><span>Per patient or procedure</span><p>Costs that rise each time the equipment is used.</p></div>
          <div className="question-grid question-grid--three">
            <NumberField path="basic.consumableCostPerUse" />
            <NumberField path="basic.professionalFeePerUse" />
            <NumberField path="basic.otherVariableCostPerUse" />
          </div>
        </div>
        <div className="question-section">
          <div className="question-section__heading"><span>Monthly overhead</span><p>The fixed cost of keeping the service ready.</p></div>
          <div className="question-grid question-grid--three">
            <NumberField path="basic.staffCostPerMonth" />
            <NumberField path="basic.electricityCostPerMonth" />
            <NumberField path="basic.otherFixedCostPerMonth" />
          </div>
        </div>
        <div className="question-section">
          <div className="question-section__heading"><span>After the warranty</span><p>A simple first-pass maintenance assumption.</p></div>
          <div className="question-grid question-grid--two">
            <NumberField path="basic.warrantyYears" />
            <NumberField path="basic.amcCmcCostPostWarranty" />
          </div>
        </div>
      </section>

      <AdvancedPanel />

      <StepNav step="costs" complete={isStepComplete("costs", state)} backHref="/assess/usage" nextHref="/results" nextLabel="Continue with Basic and see my result" />
    </div>
  );
}
