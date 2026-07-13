# Browser security and privacy audit

## 1. Assets and trust boundaries

Inventory:

- project-owned static JSON, fonts, images, and SVGs;
- user-entered names and notes;
- restored browser storage;
- URL/query/fragment values;
- third-party libraries, CDNs, analytics, embeds, and network requests;
- generated Excel, Word, and ZIP files;
- Cloudflare Pages/static hosting configuration.

For each boundary identify confidentiality, integrity, availability, and user-expectation risks. Exclude backend/authentication threats that do not exist in v1, but confirm no backend-only feature accidentally enters a static-export phase.

## 2. Browser storage

- Treat local storage as readable and writable by any script executing on the origin and by people/processes with access to the browser profile.
- Validate restored drafts against a versioned schema; never trust stored HTML, numbers, object shapes, or calculated results.
- Store inputs only, not authoritative calculated outputs, where recalculation is possible.
- Minimize retained hospital/project information and define retention, reset, successful-export clearing, quota failure, private-mode failure, corrupt data, obsolete version, and multi-tab behavior.
- Require user-facing disclosure that drafts remain on this browser/shared device where appropriate.
- Do not store secrets, credentials, session tokens, or data requiring confidentiality.

## 3. DOM and content injection

- Render user text as text through React/native escaping. Avoid `dangerouslySetInnerHTML`, `innerHTML`, `eval`, dynamic script construction, and unsafe URL schemes.
- Sanitize filenames separately from displayed labels. Constrain control characters, path separators, reserved names, misleading extensions, and excessive length.
- Treat JSON, imported/restored data, and third-party content as untrusted even when locally stored.
- Protect external new-tab links with appropriate opener/referrer behavior.

## 4. Spreadsheet, document, and ZIP exports

- Keep library-authored workbook formulas separate from user-controlled text cells.
- Ensure user text cannot be interpreted as a spreadsheet formula, external link, defined name, macro, or executable content. Test formula-initiating characters including `=`, `+`, `-`, `@`, tabs, newlines, and relevant Unicode variants.
- Do not blindly apply CSV escaping rules to XLSX; use the chosen library's explicit string-cell type and verify behavior in Excel and Google Sheets.
- Prevent HTML/XML injection into Word content and relationships.
- Generate fixed safe ZIP entry paths; reject traversal, absolute paths, duplicate/confusable names, and uncontrolled archive growth.
- Do not include macros, remote templates, external workbook links, or hidden data unless explicitly designed and reviewed.
- Verify exports contain only intended fields and no stale draft or internal metadata.

## 5. Dependencies and third parties

- Minimize dependencies, especially chart and document-generation libraries handling complex formats.
- Review maintenance, license, bundle/runtime scope, known vulnerabilities, transitive dependencies, and whether the library makes network requests.
- Pin through the lockfile and keep reproducible builds. Do not use forced audit fixes without verifying version compatibility.
- Self-host fonts/assets where already planned. Require explicit approval before analytics or telemetry can observe financial inputs.
- Confirm no secret, private source, or privileged rule is assumed safe merely because it is bundled client-side.

## 6. Static hosting and browser controls

Because Next.js static export has no runtime Next.js server, place response headers in Cloudflare Pages/static-host configuration. Evaluate:

- Content-Security-Policy tailored to actual script/style/font/image/connect needs;
- `frame-ancestors` or equivalent clickjacking protection;
- `X-Content-Type-Options: nosniff`;
- a deliberate `Referrer-Policy`;
- a least-privilege `Permissions-Policy`;
- HTTPS/HSTS at the host/domain level;
- cache policy for HTML, hashed assets, data files, and future updates;
- source-map exposure and error-page behavior.

Do not prescribe a CSP before the dependency and hosting inventory is known. Add a deployment acceptance test that fetches the real response headers.

## 7. Abuse and resilience cases

Test oversized text, huge/invalid numbers, nested or polluted JSON objects, storage exhaustion, rapid repeated export clicks, canceled downloads, background/foreground transitions, and repeated ZIP generation. The goal is safe failure without frozen UI, corrupted drafts, duplicate exports, or misleading success.
