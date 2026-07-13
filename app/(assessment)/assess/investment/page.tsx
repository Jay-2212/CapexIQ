"use client";

import { useWizard } from "../../../forms/WizardContext";
import { NumberField } from "../../../components/NumberField";
import { SelectField } from "../../../components/SelectField";
import { SliderField } from "../../../components/SliderField";
import { ProgressStepper } from "../../../components/ProgressStepper";
import { PreviewStrip } from "../../../components/PreviewStrip";
import { StepNav } from "../../../components/StepNav";
import { isStepComplete } from "../../../forms/wizardValidation";

export default function InvestmentStepPage() {
  const { state } = useWizard();

  return (
    <div className="assess-page">
      <ProgressStepper current="investment" />
      <PreviewStrip />
      <h1 tabIndex={-1}>Investment</h1>

      <NumberField path="basic.purchaseCost" />
      <NumberField path="basic.installationCost" />
      <SliderField path="basic.launchDelayMonths" />
      <SelectField path="basic.acquisitionMode" />

      <StepNav
        step="investment"
        complete={isStepComplete("investment", state)}
        backHref="/assess"
        nextHref="/assess/usage"
        nextLabel="Next: Usage & Revenue"
      />
    </div>
  );
}
