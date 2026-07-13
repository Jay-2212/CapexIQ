// The five payer-type and four ramp-period suffixes wizard-state.md §7.1 declares
// final ("re-keying elsewhere is mechanical from here") — every Advanced Group A/B
// template field in content/inputs-metadata.json expands using exactly these.

export interface PayerTypeDef {
  suffix: string;
  label: string;
}

export const PAYER_TYPES: PayerTypeDef[] = [
  { suffix: "privateCash", label: "Private cash" },
  { suffix: "insuranceTpa", label: "Insurance / TPA" },
  { suffix: "corporateCredit", label: "Corporate credit" },
  { suffix: "pmJayGovt", label: "PM-JAY / government" },
  { suffix: "other", label: "Other" },
];

export interface RampPeriodDef {
  suffix: string;
  label: string;
}

export const RAMP_PERIODS: RampPeriodDef[] = [
  { suffix: "month1to3", label: "Month 1-3" },
  { suffix: "month4to6", label: "Month 4-6" },
  { suffix: "month7to12", label: "Month 7-12" },
  { suffix: "year2Plus", label: "Year 2 onward" },
];
