/** Keeps a hover/focus tooltip's centered horizontal position away from the plot's
 *  edges — the tooltip is centered on its anchor via `translateX(-50%)`, so an
 *  anchor near 0% or 100% would otherwise push the tooltip box past the card and
 *  trigger horizontal page scroll on a narrow viewport. Shared by CashFlowChart and
 *  BreakEvenBar rather than duplicated per component. */
export function clampTooltipPercent(percent: number, min = 8, max = 92): number {
  return Math.min(max, Math.max(min, percent));
}
