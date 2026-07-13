// Generic get/set over WizardState by the same dotted path FieldDefinition.path uses
// (e.g. "basic.purchaseCost", "advanced.A.payerMixSharePct.privateCash") — lets every
// UI component and the reducer's validator operate on FieldDefinition.path directly
// instead of a hand-written switch per field, which is exactly the kind of duplicated
// ad hoc logic CONVENTIONS.md §3 warns against ("no ad hoc validation logic duplicated
// inside a component").

import type { FieldValue, WizardState } from "./wizardTypes";

export function getFieldValue(state: WizardState, path: string): FieldValue {
  const segments = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursor: any = state;
  for (const segment of segments) {
    if (cursor === null || cursor === undefined) return null;
    cursor = cursor[segment];
  }
  return cursor ?? null;
}

export function setFieldValue(
  state: WizardState,
  path: string,
  value: FieldValue
): WizardState {
  const segments = path.split(".");
  return setRecursive(state, segments, value) as WizardState;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setRecursive(node: any, segments: string[], value: FieldValue): any {
  const [head, ...rest] = segments;
  if (rest.length === 0) {
    return { ...node, [head]: value };
  }
  return {
    ...node,
    [head]: setRecursive(node[head] ?? {}, rest, value),
  };
}
