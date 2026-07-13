// Indian digit grouping and currency formatting — ux-product-spec.md §10.5 (UI
// assurance audit F9): lakh/crore grouping via Intl.NumberFormat('en-IN'), a leading
// minus sign for negatives (never accounting-style parentheses), full figures
// everywhere except compact dashboard metric callouts (which this module doesn't
// provide — that's a Phase 7 concern for the large mono metric cards specifically).

const inrFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatInr(value: number): string {
  if (!Number.isFinite(value)) return value > 0 ? "∞" : "−∞";
  const sign = value < 0 ? "−" : "";
  return `${sign}₹${inrFormatter.format(Math.abs(value))}`;
}

export function formatNumber(value: number, decimalPlaces = 0): string {
  if (!Number.isFinite(value)) return value > 0 ? "∞" : "−∞";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

export function formatPercent(value: number, decimalPlaces = 1): string {
  return `${formatNumber(value, decimalPlaces)}%`;
}

export function formatYears(value: number): string {
  if (!Number.isFinite(value)) return "Never (within useful life)";
  return `${formatNumber(value, 1)} yr`;
}
