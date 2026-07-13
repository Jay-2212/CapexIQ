"use client";

// Pre-step — equipment + identity/context fields (wizard-state.md §1.1/§1.2). Not
// part of the 3-step Basic Mode wizard proper; this is real data collection (bed size
// feeds utilization/tariff benchmarking), not an interstitial.

import { Puzzle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWizard } from "../../forms/WizardContext";
import { NumberField } from "../../components/NumberField";
import { SelectField } from "../../components/SelectField";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { isStepComplete } from "../../forms/wizardValidation";
import type { EquipmentCategory } from "../../forms/wizardTypes";

const EQUIPMENT_TILES: { category: EquipmentCategory; image: string | null }[] = [
  { category: "MRI", image: "/equipment-images/01-mri-machine.jpg" },
  { category: "CT", image: "/equipment-images/02-ct-scanner.jpg" },
  { category: "Cath Lab", image: "/equipment-images/03-cath-lab-cardiology-equipment.jpg" },
  { category: "Dialysis", image: "/equipment-images/04-dialysis-unit.jpg" },
  { category: "Ultrasound", image: "/equipment-images/05-ultrasound-machine.jpg" },
  { category: "Custom", image: null },
];

export default function PreStepPage() {
  const { state, dispatch } = useWizard();
  const router = useRouter();
  const complete = isStepComplete("preStep", state);

  return (
    <div className="assess-page">
      <h1 tabIndex={-1}>Which equipment are you evaluating?</h1>

      <div className="equipment-tile-grid" role="radiogroup" aria-label="Equipment category">
        {EQUIPMENT_TILES.map((tile) => (
          <button
            key={tile.category}
            type="button"
            role="radio"
            aria-checked={state.preStep.equipmentCategory === tile.category}
            className="equipment-tile"
            data-selected={state.preStep.equipmentCategory === tile.category}
            onClick={() =>
              dispatch({ type: "SELECT_EQUIPMENT_CATEGORY", category: tile.category })
            }
          >
            {tile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tile.image} alt="" className="equipment-tile__image" />
            ) : (
              <Puzzle aria-hidden="true" className="equipment-tile__icon" />
            )}
            <span>{tile.category}</span>
          </button>
        ))}
      </div>

      <NumberField path="preStep.hospitalBedSize" />
      <SelectField path="preStep.cityTier" />
      <SelectField path="preStep.hospitalType" />
      <TextField path="preStep.equipmentNameModel" />

      <Button
        variant="primary"
        disabled={!complete}
        onClick={() => {
          dispatch({ type: "BEGIN_TRANSITION" });
          router.push("/assess/investment");
        }}
      >
        Next: Investment
      </Button>
    </div>
  );
}
