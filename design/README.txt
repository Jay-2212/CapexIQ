Design assets for CapexIQ (capexiq.jaybharti.me), was "Healthcare Capex Decision
Support Tool" (jaybharti.me/roi) — renamed 2026-07-05, see rebrand-brief.md. The rename
pass is complete: identity layer (name, wordmark, OG copy, manifest, head tags) updated
throughout; colors, photography, icons, fonts, and hero-background.svg untouched.
All hand-built, original SVGs — no stock/AI generation, matches spec section 25's
"not generic AI-looking" and "restrained, serious" direction.

colors.md              - full color palette + rationale (semantic status colors, neutrals, chart series)
tokens.css             - the same palette as importable CSS custom properties
dashboard-mockup.svg   - full decision-dashboard mockup per section 21 (Investment Outlook gauge,
                          metric cards, break-even chart, cumulative cash-flow chart, risk callout)
favicon-mark.svg       - master icon: pulse line transitioning into ascending bars (health + growth) —
                          kept as-is through the rebrand, see rebrand-brief.md for the reasoning
favicon-exports/       - favicon-mark.svg pre-rendered as PNG at 16/32/48/180(apple-touch-icon)/512
logo-lockup.svg        - icon + "CapexIQ" wordmark, for header/nav
hero-lockup.svg        - icon + "CapexIQ" + tagline ("Know if it pays for itself, before you buy
                          it."), for the landing hero (optional lockup from the rebrand brief)
hero-background.svg    - restrained dot-grid + faint ascending trend lines for landing page hero,
                          vignetted so it recedes behind a headline (section 25.1/33.1)
og-image.svg / .png    - 1200x630 social share preview (LinkedIn/WhatsApp/Twitter link unfurl),
                          logo + tagline headline + mini dashboard teaser card
site.webmanifest       - PWA manifest pairing with the favicon set (name, colors, icon refs)
head-tags-snippet.html - copy-paste <head> tags wiring up favicons, manifest, OG/Twitter meta
rebrand-brief.md       - the brief that drove the Healthcare Capex -> CapexIQ rename, kept for history
ux-product-spec.md     - Phase 4 deliverable (2026-07-11): typography/spacing scale, tooltip
                          mechanics, "Signal" theme (accent-interactive color), landing page +
                          entry flow, default-value visual treatment, micro-interactions

All colors trace back to tokens.css — if you change a hex there, update the SVGs to match.
Fonts referenced (IBM Plex Sans/Mono, Inter) are in ../fonts/.

Accessibility note: the Investment Outlook/risk color coding (green/amber/red) is the
hardest pair for red-green colorblindness. Always pair color with the check/alert/x icons
from ../icons/ui-status/ and with text labels — never rely on color alone.
