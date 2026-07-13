// A deliberately small, dependency-free markdown-to-JSX renderer — not a general
// markdown library. Handles exactly the subset report-templates/methodology.md and
// formula-appendix.md actually use (# / ## / ### headings, --- rules, ```code fences```,
// **bold**, `inline code`, plain paragraphs) and nothing else. Neither source file uses
// lists, tables, or links (checked directly, not assumed) — if that changes, extend this
// deliberately rather than reaching for a markdown-parser dependency for a two-file,
// internally-authored content source.
//
// ISS-24: headings get a slugified `id` (via `idPrefix` — the two source docs share a
// page, so ids are namespaced per doc to avoid collisions) so the page's in-page
// table-of-contents (built from `extractHeadings`, using the exact same slug function)
// can link to them.

import type { ReactNode } from "react";

function slugify(text: string, idPrefix: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${idPrefix}-${base}`;
}

export interface HeadingEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

/** Same heading scan as renderSimpleMarkdown, exposed separately so the page can build
 *  a table of contents before/alongside rendering the full body. */
export function extractHeadings(markdown: string, idPrefix: string): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  for (const line of markdown.split("\n")) {
    if (line.startsWith("### ")) {
      const text = line.slice(4).trim();
      headings.push({ level: 3, text, id: slugify(text, idPrefix) });
    } else if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      headings.push({ level: 2, text, id: slugify(text, idPrefix) });
    }
  }
  return headings;
}

export interface TocEntry extends HeadingEntry {
  children: HeadingEntry[];
}

/** Groups a flat heading list into ToC nodes — each h3 nests under the nearest
 *  preceding h2. Neither source doc nests any deeper than h2/h3. */
export function nestHeadings(headings: HeadingEntry[]): TocEntry[] {
  const nodes: TocEntry[] = [];
  let current: TocEntry | null = null;
  for (const heading of headings) {
    if (heading.level === 2) {
      current = { ...heading, children: [] };
      nodes.push(current);
    } else if (current) {
      current.children.push(heading);
    }
  }
  return nodes;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export function renderSimpleMarkdown(markdown: string, idPrefix: string): ReactNode[] {
  const lines = markdown.split("\n");
  const blocks: ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let codeBuffer: string[] | null = null;
  let key = 0;

  const flushParagraph = () => {
    const text = paragraphBuffer.join(" ").trim();
    if (text) blocks.push(<p key={key++}>{renderInline(text)}</p>);
    paragraphBuffer = [];
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (codeBuffer === null) {
        flushParagraph();
        codeBuffer = [];
      } else {
        blocks.push(
          <pre key={key++}>
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = null;
      }
      continue;
    }
    if (codeBuffer !== null) {
      codeBuffer.push(line);
      continue;
    }
    if (line.trim() === "---") {
      flushParagraph();
      blocks.push(<hr key={key++} />);
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph();
      const text = line.slice(4).trim();
      blocks.push(
        <h3 key={key++} id={slugify(text, idPrefix)}>
          {renderInline(text)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      const text = line.slice(3).trim();
      blocks.push(
        <h2 key={key++} id={slugify(text, idPrefix)}>
          {renderInline(text)}
        </h2>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      flushParagraph();
      const text = line.slice(2).trim();
      blocks.push(
        <h1 key={key++} id={slugify(text, idPrefix)}>
          {renderInline(text)}
        </h1>
      );
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      continue;
    }
    paragraphBuffer.push(line.trim());
  }
  flushParagraph();

  return blocks;
}
