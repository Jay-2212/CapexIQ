"use client";

// Picks the right control for a field's controlType — used wherever fields are
// iterated generically (the Advanced Mode panel's groups) rather than laid out by
// hand one at a time (the Basic Mode step pages, which import NumberField/
// SliderField/SelectField directly for full layout control).

import { getFieldDefinition } from "../forms/fieldSchema";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";
import { SliderField } from "./SliderField";
import { TextField } from "./TextField";

export function FieldRenderer({ path }: { path: string }) {
  const def = getFieldDefinition(path);

  switch (def.controlType) {
    case "slider":
      return <SliderField path={path} />;
    case "select":
      return <SelectField path={path} />;
    case "text":
      return <TextField path={path} />;
    case "input":
      return <NumberField path={path} />;
    case "reserved":
    case "structural":
      return null;
    default:
      return null;
  }
}
