// Separate Methodology page (design/ux-product-spec.md §5.3, resolves SPEC.md §36.1
// Q9) — linked from the landing page header/footer. Renders the existing
// report-templates/methodology.md and formula-appendix.md content plainly; a
// bespoke-designed version of this page is a deliberate follow-up (ISS-24), not done
// here, per Phase 6's own scope (the landing page, not this page, was the ask).
// Server component (no "use client") — reads both files at build time via `fs`,
// which is fine for `output: "export"": both reads resolve during `next build`, not
// at request time.

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { renderSimpleMarkdown } from "./renderSimpleMarkdown";

export const metadata = {
  title: "Methodology — CapexIQ",
};

export default function MethodologyPage() {
  const methodology = fs.readFileSync(
    path.join(process.cwd(), "report-templates/methodology.md"),
    "utf-8"
  );
  const formulaAppendix = fs.readFileSync(
    path.join(process.cwd(), "report-templates/formula-appendix.md"),
    "utf-8"
  );

  return (
    <div className="methodology-page">
      <p className="methodology-page__back">
        <Link href="/">&larr; Back to CapexIQ</Link>
      </p>
      <article className="methodology-page__content">
        {renderSimpleMarkdown(methodology)}
        <hr />
        {renderSimpleMarkdown(formulaAppendix)}
      </article>
    </div>
  );
}
