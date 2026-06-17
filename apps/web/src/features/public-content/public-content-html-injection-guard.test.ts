import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const PUBLIC_CONTENT_RENDERING_FILES = [
  "src/features/public-content/public-content-block-view.tsx",
  "src/features/public-content/public-content-ui.tsx",
] as const;

function readWebSource(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("public content HTML injection guard", () => {
  it("does not render public content through raw HTML sinks", () => {
    const renderingSource =
      PUBLIC_CONTENT_RENDERING_FILES.map(readWebSource).join("\n");

    expect(renderingSource).not.toContain("dangerouslySetInnerHTML");
    expect(renderingSource).not.toMatch(/\bMarkdownContent\b/);
    expect(renderingSource).not.toMatch(/\bReactMarkdown\b/);
    expect(renderingSource).not.toMatch(/\bmarked\s*\(/);
    expect(renderingSource).not.toMatch(/\bremark\s*\(/);
  });
});
