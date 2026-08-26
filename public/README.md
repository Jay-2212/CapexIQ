Next.js static-export public assets — served as-is at the site root. Served, resized
and WebP-encoded copies used by the app:
- `equipment-images/` — the pre-step's equipment tiles, `app/(assessment)/assess/page.tsx`.
- `people-personas/` — the landing page's "Who it's for" section, `app/page.tsx`.
  `05-operations-head-coo-v2.webp` is the distinct AI-generated Indian COO portrait.
- `design/hero-background.svg` — legacy decorative hero background.
- `design/hero-ct-suite-v2.webp` — AI-generated warm-beige CT suite used by the current
  landing hero.

Each repo-root copy stays the canonical, sourced asset folder (see `people-personas/
sources.txt`/`equipment-images/sources.txt` for licensing/attribution); the copies here
exist only because `output: "export"` requires static assets to live under `public/` to
be served at a URL. The served copies are resized and visually lossy encoded at
quality 85; they are not mathematically lossless. If any repo-root source folder
changes, regenerate the affected public WebP files — there's no build step wiring the
two together yet.

The two `*-v2` assets were created 2026-07-13 with OpenAI's built-in image
generation in `generate` mode for this project, not copied from an external source.
Prompt briefs: (1) a premium editorial hospital CT suite in warm beige and ivory,
three-quarter CT gantry, soft daylight, restrained clinical green, no people, text,
logos, gradients, or sci-fi styling; (2) a warm editorial portrait of a confident
Indian woman hospital COO in her 40s, natural window light, contemporary hospital
interior, beige/ivory/clinical-green palette, distinct from the administrator, no text
or logos. Generated originals were resized and re-encoded for web delivery after
copying to `public/`.
