Next.js static-export public assets — served as-is at the site root. Currently just
`equipment-images/`, a served copy of the repo-root `equipment-images/` folder (used by
the pre-step's equipment tiles, `app/(assessment)/assess/page.tsx`). The repo-root copy
stays the canonical, sourced asset folder (see its own `sources.txt` for licensing/
attribution); this one exists only because `output: "export"` requires static assets to
live under `public/` to be served at a URL. If `equipment-images/` ever changes, re-copy
the affected files here too — there's no build step wiring the two together yet.
