"use client";

import { ArrowRight, Puzzle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWizard } from "../../forms/WizardContext";
import { NumberField } from "../../components/NumberField";
import { SelectField } from "../../components/SelectField";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { firstInvalidFieldOnStep, isStepComplete } from "../../forms/wizardValidation";
import type { EquipmentCategory } from "../../forms/wizardTypes";

const EQUIPMENT_TILES: { category: EquipmentCategory; image: string | null; note: string }[] = [
  { category: "MRI", image: "/equipment-images/01-mri-machine.jpg", note: "Magnetic resonance" },
  { category: "CT", image: "/equipment-images/02-ct-scanner.jpg", note: "Computed tomography" },
  { category: "Cath Lab", image: "/equipment-images/03-cath-lab-cardiology-equipment.jpg", note: "Interventional cardiology" },
  { category: "Dialysis", image: "/equipment-images/04-dialysis-unit.jpg", note: "Renal care" },
  { category: "Ultrasound", image: "/equipment-images/05-ultrasound-machine.jpg", note: "Diagnostic imaging" },
  { category: "Custom", image: null, note: "Another equipment type" },
];

export default function PreStepPage() {
  const { state, dispatch } = useWizard();
  const router = useRouter();
  const selected = EQUIPMENT_TILES.find((tile) => tile.category === state.preStep.equipmentCategory);
  const complete = isStepComplete("preStep", state);

  // ISS-25: mirrors StepNav.goNext exactly (audit F7's disabled-"Next"
  // discoverability, plus the ATTEMPT_STEP reveal) — this page predates StepNav's
  // extraction and had its own inline Button/native-disabled instead, which meant a
  // blocked Next here gave no clue what was missing and (once error display became
  // touch/attempt-gated) would otherwise never reveal these fields' errors at all.
  const continueAssessment = () => {
    if (!complete) {
      dispatch({ type: "ATTEMPT_STEP", step: "preStep" });
      const invalidPath = firstInvalidFieldOnStep("preStep", state);
      const element = invalidPath ? document.getElementById(invalidPath) : null;
      element?.focus();
      element?.scrollIntoView({ block: "center" });
      return;
    }
    dispatch({ type: "BEGIN_TRANSITION" });
    router.push("/assess/investment");
  };

  return (
    <div className="assess-page assess-page--wide">
      <section className="narrative-intro">
        <span className="narrative-intro__eyebrow">A thoughtful first look</span>
        <h1 tabIndex={-1}>What are you considering for your hospital?</h1>
        <p>Choose the equipment first. We’ll keep it with you as we build the assessment.</p>
      </section>

      <div className="equipment-tile-grid" role="radiogroup" aria-label="Equipment category">
        {EQUIPMENT_TILES.map((tile) => (
          <button
            key={tile.category}
            type="button"
            role="radio"
            aria-checked={state.preStep.equipmentCategory === tile.category}
            className="equipment-tile"
            data-selected={state.preStep.equipmentCategory === tile.category}
            onClick={() => dispatch({ type: "SELECT_EQUIPMENT_CATEGORY", category: tile.category })}
          >
            {tile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tile.image} alt="" className="equipment-tile__image" />
            ) : (
              <div className="equipment-tile__icon"><Puzzle aria-hidden="true" size={34} /></div>
            )}
            <span className="equipment-tile__name">{tile.category}</span>
            <span className="equipment-tile__note">{tile.note}</span>
          </button>
        ))}
      </div>

      {selected && (
        <section className="profile-stage" aria-labelledby="profile-heading">
          <div className="profile-stage__visual">
            {selected.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.image} alt="" />
            ) : <Puzzle aria-hidden="true" size={68} />}
            <span>{selected.category} assessment</span>
          </div>
          <div className="profile-stage__form">
            <span className="narrative-intro__eyebrow">Let’s make it yours</span>
            <h2 id="profile-heading">Tell us about the hospital.</h2>
            <p className="stage-copy">A little context helps us frame the numbers at the right scale.</p>
            <div className="question-grid question-grid--two">
              <div className="question-grid__full"><TextField path="preStep.hospitalName" /></div>
              <NumberField path="preStep.hospitalBedSize" />
              <SelectField path="preStep.cityTier" />
              <SelectField path="preStep.hospitalType" />
              <TextField path="preStep.equipmentNameModel" />
            </div>
            <Button variant="primary" aria-disabled={!complete} onClick={continueAssessment}>
              Begin the assessment <ArrowRight aria-hidden="true" size={17} />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
