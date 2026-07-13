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
      <h1 tabIndex={-1}>Operating Costs</h1>

      <NumberField path="basic.consumableCostPerUse" />
      <NumberField path="basic.professionalFeePerUse" />
      <NumberField path="basic.otherVariableCostPerUse" />
      <NumberField path="basic.staffCostPerMonth" />
      <NumberField path="basic.electricityCostPerMonth" />
      <NumberField path="basic.otherFixedCostPerMonth" />
      <NumberField path="basic.warrantyYears" />
      <NumberField path="basic.amcCmcCostPostWarranty" />

      <AdvancedPanel />

      <StepNav
        step="costs"
        complete={isStepComplete("costs", state)}
        backHref="/assess/usage"
        nextHref="/results"
        nextLabel="See results"
      />
    </div>
  );
}
