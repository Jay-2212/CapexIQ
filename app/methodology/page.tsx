// Methodology page (design/ux-product-spec.md §5.3, resolves SPEC.md §36.1 Q9) —
// linked from the landing page header/footer. Renders the existing
// report-templates/methodology.md and formula-appendix.md content through
// renderSimpleMarkdown, alongside a sticky in-page table of contents built from the
// same two docs' own headings (ISS-24 — the previous version rendered plainly with no
// bespoke layout). Credibility/reference-styled per §5.3 ("no sales language"), not a
// marketing page: no new copy is introduced here beyond structural labels, and no
// gradients/glassmorphism per §1.3.
// Server component (no "use client") — reads both files at build time via `fs`,
// which is fine for `output: "export"": both reads resolve during `next build`, not
// at request time.

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { extractHeadings, nestHeadings, renderSimpleMarkdown } from "./renderSimpleMarkdown";

export const metadata = {
  title: "Methodology — CapexIQ",
};

/** Splits a doc's own leading "# Title" line from its body — the page supplies its
 *  own single h1 (a11y: one h1 per page) and a per-section h2 instead of letting each
 *  source doc's leading heading render as a second/third page-level h1. */
function splitTitle(markdown: string): { title: string; body: string } {
  const newlineIndex = markdown.indexOf("\n");
  const firstLine = newlineIndex === -1 ? markdown : markdown.slice(0, newlineIndex);
  if (!firstLine.startsWith("# ")) return { title: "", body: markdown };
  return { title: firstLine.slice(2).trim(), body: markdown.slice(newlineIndex + 1) };
}

export default function MethodologyPage() {
  const methodologyRaw = fs.readFileSync(
    path.join(process.cwd(), "report-templates/methodology.md"),
    "utf-8"
  );
  const appendixRaw = fs.readFileSync(
    path.join(process.cwd(), "report-templates/formula-appendix.md"),
    "utf-8"
  );

  const { title: methodologyTitle, body: methodologyBody } = splitTitle(methodologyRaw);
  const { title: appendixTitle, body: appendixBody } = splitTitle(appendixRaw);

  const tocGroups = [
    {
      id: "methodology-section",
      label: methodologyTitle,
      items: nestHeadings(extractHeadings(methodologyBody, "methodology")),
    },
    {
      id: "appendix-section",
      label: appendixTitle,
      items: nestHeadings(extractHeadings(appendixBody, "appendix")),
    },
  ];

  return (
    <div className="methodology-page">
      <header className="landing-header">
        <Link href="/" className="landing-header__logo">
          <svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true">
            <rect x="0" y="0" width="40" height="40" rx="9" fill="#1E2A3A" />
            <path
              d="M 5 27.5 L 10 27.5 L 12.5 20 L 15.6 32.5 L 18.75 27.5 L 22.5 27.5"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="22.5" y="20" width="4" height="7.5" rx="0.8" fill="#FFFFFF" />
            <rect x="28.5" y="15" width="4" height="12.5" rx="0.8" fill="#FFFFFF" />
            <rect x="34.5" y="10" width="4" height="17.5" rx="0.8" fill="#FFFFFF" opacity="0.92" />
          </svg>
          <span>CapexIQ</span>
        </Link>
        <nav className="landing-header__nav">
          <Link href="/assess" className="button button--primary">
            Start Assessment
          </Link>
        </nav>
      </header>

      <div className="methodology-page__intro">
        <h1 id="methodology-section" tabIndex={-1}>
          {methodologyTitle}
        </h1>
      </div>

      <div className="methodology-layout">
        <nav className="methodology-toc" aria-label="On this page">
          {tocGroups.map((group) => (
            <div key={group.id} className="methodology-toc__group">
              <a href={`#${group.id}`} className="methodology-toc__group-label">
                {group.label}
              </a>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.text}</a>
                    {item.children.length > 0 && (
                      <ul>
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <a href={`#${child.id}`}>{child.text}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <article className="methodology-content">
          {renderSimpleMarkdown(methodologyBody, "methodology")}
          <h2 id="appendix-section">{appendixTitle}</h2>
          {renderSimpleMarkdown(appendixBody, "appendix")}
        </article>
      </div>

      <footer className="landing-footer">
        <p className="landing-footer__links">
          <Link href="/">Back to CapexIQ</Link>
          {" · "}
          <a href="https://github.com/Jay-2212/CapexIQ" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </p>
        <p className="landing-footer__disclaimer">
          This tool is a decision-support calculator, not financial, investment, tax,
          or legal advice.
        </p>
      </footer>
    </div>
  );
}
