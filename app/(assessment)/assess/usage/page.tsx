"use client";

import { useWizard } from "../../../forms/WizardContext";
import { SliderField } from "../../../components/SliderField";
import { ProgressStepper } from "../../../components/ProgressStepper";
import { PreviewStrip } from "../../../components/PreviewStrip";
import { StepNav } from "../../../components/StepNav";
import { isStepComplete } from "../../../forms/wizardValidation";

export default function UsageStepPage() {
  const { state } = useWizard();

  return (
    <div className="assess-page">
      <ProgressStepper current="usage" />
      <PreviewStrip />
      <h1 tabIndex={-1}>Usage &amp; Revenue</h1>

      <SliderField path="basic.usagePerDay" />
      <SliderField path="basic.billedTariffPerUse" />
      <SliderField path="basic.workingDaysPerMonth" />

      <StepNav
        step="usage"
        complete={isStepComplete("usage", state)}
        backHref="/assess/investment"
        nextHref="/assess/costs"
        nextLabel="Next: Operating Costs"
      />
    </div>
  );
}
