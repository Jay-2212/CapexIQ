import { describe, expect, it } from "vitest";

import {
  formatInr,
  formatInrCompact,
  formatNumber,
  formatPercent,
  formatYears,
} from "../../app/components/formatting";

// formatInr/formatNumber/formatPercent/formatYears had no dedicated unit test before
// this block — only exercised indirectly through tests/exports/word-generator.test.ts
// assertions built from the same functions (which proves round-trip consistency, not
// correctness of the formatting itself). Task requirement: "rounding and currency
// precision."
describe("formatInr", () => {
  it("groups digits Indian-style (lakh/crore, not thousands) with no decimal places", () => {
    expect(formatInr(1_000_000)).toBe("₹10,00,000");
    expect(formatInr(10_000_000)).toBe("₹1,00,00,000");
  });

  it("rounds to the nearest rupee rather than showing paise", () => {
    expect(formatInr(1234.5)).toBe("₹1,235"); // banker's/half-up per Intl — just no decimals
    expect(formatInr(1234.4)).toBe("₹1,234");
  });

  it("uses a leading minus sign, never accounting-style parentheses", () => {
    expect(formatInr(-50000)).toBe("−₹50,000");
  });

  it("formats exactly zero without a sign", () => {
    expect(formatInr(0)).toBe("₹0");
  });

  it("falls back to an infinity glyph for non-finite values (e.g. an unbounded EAC)", () => {
    expect(formatInr(Infinity)).toBe("∞");
    expect(formatInr(-Infinity)).toBe("−∞");
  });
});

describe("formatNumber", () => {
  it("defaults to zero decimal places", () => {
    expect(formatNumber(12345.678)).toBe("12,346");
  });

  it("honors an explicit decimal-place count, padding with trailing zeros", () => {
    expect(formatNumber(3, 2)).toBe("3.00");
    expect(formatNumber(3.14159, 2)).toBe("3.14");
  });
});

describe("formatPercent", () => {
  it("defaults to one decimal place with a trailing % sign", () => {
    expect(formatPercent(12.5)).toBe("12.5%");
  });

  it("formats a negative percentage (e.g. negative ROI) with the sign preserved — note: formatPercent/formatNumber use Intl's plain ASCII hyphen-minus, unlike formatInr's explicit U+2212 minus sign; see ISSUES.md ISS-33", () => {
    expect(formatPercent(-42.54545, 2)).toBe("-42.55%");
  });

  it("formats exactly 0%", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("formatYears", () => {
  it("formats a fractional year to one decimal place with a 'yr' suffix", () => {
    expect(formatYears(1.22807)).toBe("1.2 yr");
  });

  it("falls back to a plain-language 'never' for an infinite payback rather than showing 'Infinity yr'", () => {
    expect(formatYears(Infinity)).toBe("Never (within useful life)");
  });

  it("formats exactly zero years (immediate payback)", () => {
    expect(formatYears(0)).toBe("0.0 yr");
  });
});

describe("formatInrCompact", () => {
  it("formats crore-scale values with a Cr suffix", () => {
    expect(formatInrCompact(14000000)).toBe("₹1.40 Cr");
  });

  it("formats lakh-scale values with an L suffix", () => {
    expect(formatInrCompact(1800000)).toBe("₹18.00 L");
  });

  it("falls back to the full figure below a lakh", () => {
    expect(formatInrCompact(45000)).toBe("₹45,000");
  });

  it("preserves the leading minus sign for negative values at every scale", () => {
    expect(formatInrCompact(-14000000)).toBe("−₹1.40 Cr");
    expect(formatInrCompact(-1800000)).toBe("−₹18.00 L");
    expect(formatInrCompact(-45000)).toBe("−₹45,000");
  });

  it("preserves the infinite-value fallback", () => {
    expect(formatInrCompact(Infinity)).toBe("∞");
    expect(formatInrCompact(-Infinity)).toBe("−∞");
  });
});
