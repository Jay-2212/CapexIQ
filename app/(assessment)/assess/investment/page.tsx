"use client";

import { useWizard } from "../../../forms/WizardContext";
import { SelectField } from "../../../components/SelectField";
import { SliderField } from "../../../components/SliderField";
import { CurrencyUnitField } from "../../../components/CurrencyUnitField";
import { ProgressStepper } from "../../../components/ProgressStepper";
import { PreviewStrip } from "../../../components/PreviewStrip";
import { StepNav } from "../../../components/StepNav";
import { isStepComplete } from "../../../forms/wizardValidation";

export default function InvestmentStepPage() {
  const { state } = useWizard();
  const hospital = state.preStep.hospitalName || "your hospital";

  return (
    <div className="assess-page">
      <ProgressStepper current="investment" />
      <PreviewStrip />
      <section className="narrative-intro narrative-intro--compact">
        <span className="narrative-intro__eyebrow">01 · The commitment</span>
        <h1 tabIndex={-1}>What will it take to bring this to {hospital}?</h1>
        <p>Start with the complete upfront commitment. Choose lakhs or crores in the way your quote is written.</p>
      </section>

      <section className="question-card">
        <div className="question-grid question-grid--two">
          <CurrencyUnitField path="basic.purchaseCost" field="purchaseCost" />
          <CurrencyUnitField path="basic.installationCost" field="installationCost" />
          <SliderField path="basic.launchDelayMonths" />
          <SelectField path="basic.acquisitionMode" />
        </div>
      </section>

      <StepNav step="investment" complete={isStepComplete("investment", state)} backHref="/assess" nextHref="/assess/usage" nextLabel="Continue to demand" />
    </div>
  );
}
