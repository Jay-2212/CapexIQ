import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Clock3,
  FileCheck2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const PERSONAS = [
  {
    image: "/people-personas/01-hospital-administrator.jpg",
    label: "Administrators",
    note: "Frame the operating case",
  },
  {
    image: "/people-personas/05-operations-head-coo-v2.png",
    label: "Operations",
    note: "Test demand and readiness",
  },
  {
    image: "/people-personas/03-cfo-finance-manager.jpg",
    label: "Finance",
    note: "Stress-test the return",
  },
  {
    image: "/people-personas/04-healthcare-consultant.jpg",
    label: "Advisors",
    note: "Compare the full commitment",
  },
];

const STEPS = [
  {
    icon: Building2,
    number: "01",
    title: "Set the context",
    copy: "Choose the equipment and tell us about your hospital.",
  },
  {
    icon: FileCheck2,
    number: "02",
    title: "Build the case",
    copy: "Add investment, demand, tariff and operating assumptions.",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Read the decision",
    copy: "See returns, payback, risks and what is driving the answer.",
  },
];

function Brand() {
  return (
    <div className="landing-header__logo">
      <svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill="#243631" />
        <path d="M5 27.5h5l2.5-7.5 3.1 12.5 3.15-5h3.75" fill="none" stroke="#FFFDF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="22.5" y="20" width="4" height="7.5" rx=".8" fill="#FFFDF7" />
        <rect x="28.5" y="15" width="4" height="12.5" rx=".8" fill="#FFFDF7" />
        <rect x="34.5" y="10" width="4" height="17.5" rx=".8" fill="#FFFDF7" opacity=".9" />
      </svg>
      <span>CapexIQ</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="landing landing--v3">
      <header className="landing-header landing-shell">
        <Brand />
        <nav className="landing-header__nav" aria-label="Primary navigation">
          <Link href="/methodology">Methodology</Link>
          <Link href="/assess" className="button button--primary">
            Begin assessment <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero-v3 landing-shell">
          <div className="landing-hero-v3__copy">
            <span className="landing-kicker">
              <Sparkles aria-hidden="true" size={14} /> Hospital capex decision support
            </span>
            <h1>A clearer business case for your next <em>clinical investment.</em></h1>
            <p>
              Turn your quote and operating assumptions into a decision-ready view of
              ROI, payback, cash flow and risk—without building another spreadsheet.
            </p>
            <div className="landing-hero-v3__actions">
              <Link href="/assess" className="button button--primary">
                Start your assessment <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link href="/methodology" className="landing-text-link">
                See how the model works
              </Link>
            </div>
            <div className="landing-hero-v3__notes" aria-label="Assessment details">
              <span><Clock3 aria-hidden="true" size={15} /> About 5 minutes to start</span>
              <span><ShieldCheck aria-hidden="true" size={15} /> Saved only in this browser</span>
            </div>
          </div>

          <div className="landing-hero-v3__visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/design/hero-ct-suite-v2.png" alt="A modern CT scanner suite" />
            <div className="landing-decision-card">
              <div className="landing-decision-card__heading">
                <span>Decision brief</span>
                <span className="landing-decision-card__status"><i /> Ready to explain</span>
              </div>
              <strong>See the return and the reality behind it.</strong>
              <div className="landing-decision-card__metrics" aria-hidden="true">
                <span>ROI</span><span>NPV</span><span>IRR</span><span>Payback</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-signal-strip" aria-label="Model coverage">
          <div className="landing-shell">
            <span>Built for real hospital investment decisions</span>
            <ul>
              <li><Check aria-hidden="true" size={14} /> Investment returns</li>
              <li><Check aria-hidden="true" size={14} /> Cash-flow timing</li>
              <li><Check aria-hidden="true" size={14} /> Break-even usage</li>
              <li><Check aria-hidden="true" size={14} /> Downside resilience</li>
            </ul>
          </div>
        </section>

        <section className="landing-process landing-shell">
          <div className="landing-section-intro">
            <span className="landing-kicker">A guided assessment</span>
            <h2>From equipment quote to an explainable decision.</h2>
            <p>We ask for a few related numbers at a time, in the order your team already thinks about them.</p>
          </div>
          <ol className="landing-process__steps">
            {STEPS.map(({ icon: Icon, number, title, copy }) => (
              <li key={number}>
                <div className="landing-process__icon"><Icon aria-hidden="true" size={23} /></div>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="landing-depth-v3">
          <div className="landing-depth-v3__inner landing-shell">
            <div className="landing-depth-v3__copy">
              <span className="landing-kicker">Depth on demand</span>
              <h2>Start simple. Go deeper only when it changes the answer.</h2>
              <p>
                Basic Mode gives you a credible first pass. Advanced Mode opens the
                assumptions finance teams need for a more rigorous review.
              </p>
              <Link href="/assess" className="button landing-button--light">
                Build the first pass <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </div>
            <div className="landing-depth-v3__cards">
              <article>
                <span>Basic</span>
                <h3>The essential operating case</h3>
                <ul>
                  <li>Purchase and site cost</li>
                  <li>Expected usage and tariff</li>
                  <li>Overheads and maintenance</li>
                </ul>
              </article>
              <article>
                <span>Advanced</span>
                <h3>The finance-team layer</h3>
                <ul>
                  <li>Payer mix and collections</li>
                  <li>Financing and ramp-up</li>
                  <li>Lifecycle assumptions</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-roles landing-shell">
          <div className="landing-section-intro landing-section-intro--roles">
            <span className="landing-kicker">Built for the decision room</span>
            <h2>One model. A shared view across roles.</h2>
          </div>
          <div className="landing-roles__grid">
            {PERSONAS.map((persona) => (
              <article key={persona.label}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={persona.image} alt="" />
                <div><h3>{persona.label}</h3><p>{persona.note}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-final-v3 landing-shell">
          <div>
            <span className="landing-kicker">Bring the quote. Bring your assumptions.</span>
            <h2>Leave with a decision you can explain.</h2>
          </div>
          <Link href="/assess" className="button button--primary">
            Begin your assessment <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </section>
      </main>

      <footer className="landing-footer landing-shell">
        <Brand />
        <p>This is decision support—not financial, investment, tax, or legal advice.</p>
        <div><Link href="/methodology">Methodology</Link><a href="https://github.com/Jay-2212/CapexIQ" target="_blank" rel="noreferrer">GitHub</a></div>
      </footer>
    </div>
  );
}
