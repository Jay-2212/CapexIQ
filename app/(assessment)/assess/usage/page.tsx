"use client";

import { useWizard } from "../../../forms/WizardContext";
import { NumberField } from "../../../components/NumberField";
import { SliderField } from "../../../components/SliderField";
import { ProgressStepper } from "../../../components/ProgressStepper";
import { PreviewStrip } from "../../../components/PreviewStrip";
import { StepNav } from "../../../components/StepNav";
import { isStepComplete } from "../../../forms/wizardValidation";

export default function UsageStepPage() {
  const { state } = useWizard();
  const equipment = state.preStep.equipmentCategory ?? "equipment";

  return (
    <div className="assess-page">
      <ProgressStepper current="usage" />
      <PreviewStrip />
      <section className="narrative-intro narrative-intro--compact">
        <span className="narrative-intro__eyebrow">02 · The demand</span>
        <h1 tabIndex={-1}>How busy do you expect the {equipment} to be?</h1>
        <p>Think about a normal working day—not the best day. These three numbers shape the revenue story.</p>
      </section>

      <section className="question-card">
        <div className="question-grid question-grid--two">
          <SliderField path="basic.usagePerDay" />
          <NumberField path="basic.billedTariffPerUse" />
          <SliderField path="basic.workingDaysPerMonth" />
        </div>
      </section>

      <StepNav step="usage" complete={isStepComplete("usage", state)} backHref="/assess/investment" nextHref="/assess/costs" nextLabel="Continue to running costs" />
    </div>
  );
}
