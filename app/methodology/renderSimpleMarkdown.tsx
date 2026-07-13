// A deliberately small, dependency-free markdown-to-JSX renderer — not a general
// markdown library. Handles exactly the subset report-templates/methodology.md and
// formula-appendix.md actually use (# / ## / ### headings, --- rules, ```code fences```,
// **bold**, plain paragraphs) and nothing else. If those source files start using a
// construct this doesn't handle (lists, tables, links), extend it deliberately rather
// than reaching for a markdown-parser dependency for a two-file, internally-authored
// content source.

import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

export function renderSimpleMarkdown(markdown: string): ReactNode[] {
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
      blocks.push(<h3 key={key++}>{renderInline(line.slice(4))}</h3>);
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push(<h2 key={key++}>{renderInline(line.slice(3))}</h2>);
      continue;
    }
    if (line.startsWith("# ")) {
      flushParagraph();
      blocks.push(<h1 key={key++}>{renderInline(line.slice(2))}</h1>);
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
