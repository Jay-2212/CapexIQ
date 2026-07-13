Next.js static-export public assets — served as-is at the site root. Served copies of
repo-root asset folders, used by the app:
- `equipment-images/` — the pre-step's equipment tiles, `app/(assessment)/assess/page.tsx`.
- `people-personas/` — the landing page's "Who it's for" section, `app/page.tsx`.
- `design/hero-background.svg` — the landing page hero's decorative background.

Each repo-root copy stays the canonical, sourced asset folder (see `people-personas/
sources.txt`/`equipment-images/sources.txt` for licensing/attribution); the copies here
exist only because `output: "export"` requires static assets to live under `public/` to
be served at a URL. If any of these repo-root folders change, re-copy the affected
files here too — there's no build step wiring the two together yet.
