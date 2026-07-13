import { describe, expect, it } from "vitest";

import { formatInrCompact } from "../../app/components/formatting";

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
