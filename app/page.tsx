// Landing page (design/ux-product-spec.md §5) — single-scroll, not a multi-page
// marketing site (§5.1): header, hero, how-it-works, who-it's-for, depth, footer.
// Entry flow resolves straight to the pre-step per §5.2 ("Start Assessment" -> /assess,
// never straight to step 1 of the wizard proper). No sales language (§5.1's own rule,
// Jay's explicit rejection of "nothing like this in the market" phrasing) — every
// claim below is either already built (Basic/Advanced modes, live sensitivity,
// Investment Outlook score) or explicitly framed as not-yet-built, mirroring
// app/(assessment)/results/page.tsx's own "coming in a later phase" honesty rather
// than describing Excel/Word export as present-tense capability before it exists.

import Link from "next/link";
import { ClipboardList, TrendingUp } from "lucide-react";

const PERSONAS = [
  {
    image: "/people-personas/01-hospital-administrator.jpg",
    label: "Hospital administrators",
  },
  {
    image: "/people-personas/02-operations-head-coo.jpg",
    label: "Operations heads / COOs",
  },
  {
    image: "/people-personas/03-cfo-finance-manager.jpg",
    label: "CFOs / finance managers",
  },
  {
    image: "/people-personas/04-healthcare-consultant.jpg",
    label: "Biomedical & procurement consultants",
  },
];

export default function Home() {
  return (
    <div className="landing">
      <header className="landing-header">
        {/* Compact logo lockup — icon + wordmark, matching design/hero-lockup.svg */}
        <div className="landing-header__logo">
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
        </div>
        <nav className="landing-header__nav">
          <Link href="/methodology">Methodology</Link>
          <Link href="/assess" className="button button--primary">
            Start Assessment
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <h1>Know if it pays for itself, before you buy it.</h1>
        <p>
          CapexIQ is a decision-support calculator for Indian hospitals evaluating a
          high-value equipment purchase — MRI, CT, Cath Lab, dialysis, or ultrasound.
          Enter your numbers and see ROI, payback, NPV, IRR, and an Investment Outlook
          score built from them.
        </p>
        <Link href="/assess" className="button button--primary">
          Start Assessment
        </Link>
      </section>

      <section className="landing-how">
        <h2>How it works</h2>
        <ol className="landing-how__steps">
          <li>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/equipment-images/01-mri-machine.jpg" alt="" className="landing-how__image" />
            <h3>1. Select your equipment</h3>
            <p>Pick the equipment type and enter your hospital&apos;s bed size.</p>
          </li>
          <li>
            <div className="landing-how__icon">
              <ClipboardList aria-hidden="true" size={40} />
            </div>
            <h3>2. Enter your details</h3>
            <p>
              Purchase cost, usage, and operating costs — Basic Mode takes a few
              minutes; Advanced Mode adds payer mix, financing, and lifecycle
              assumptions if you want more precision.
            </p>
          </li>
          <li>
            <div className="landing-how__icon">
              <TrendingUp aria-hidden="true" size={40} />
            </div>
            <h3>3. See if it pays for itself</h3>
            <p>
              An Investment Outlook score, NPV, IRR, payback period, and break-even
              usage — recalculated live as you type.
            </p>
          </li>
        </ol>
      </section>

      <section className="landing-personas">
        <h2>Who it&apos;s for</h2>
        <div className="landing-personas__grid">
          {PERSONAS.map((persona) => (
            <div key={persona.label} className="landing-personas__card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={persona.image} alt="" className="landing-personas__image" />
              <p>{persona.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-depth">
        <h2>What&apos;s in the tool</h2>
        <ul>
          <li>Basic Mode for a fast first-pass estimate, Advanced Mode for payer mix, financing, and lifecycle assumptions when you want more precision.</li>
          <li>Live sensitivity — every result recalculates as you change an input, with no separate &quot;recalculate&quot; step.</li>
          <li>An Investment Outlook score that summarizes the read at a glance, with the specific driver behind it.</li>
        </ul>
        <p className="landing-depth__note">
          A full dashboard with charts and sensitivity analysis, plus Excel/Word
          export with live embedded formulas, is coming in a later phase — every
          number shown today is already the same live calculation those views will
          use.
        </p>
      </section>

      <footer className="landing-footer">
        <p className="landing-footer__links">
          <Link href="/methodology">Methodology</Link>
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
