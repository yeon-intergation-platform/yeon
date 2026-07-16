import { describe, expect, it } from "vitest";
import { parsePublicContentManuscript } from "../../../scripts/dry-run-public-content-import";

describe("public content Markdown import frontmatter", () => {
  it("exporter의 quote, backslash, newline escape를 원래 값으로 복원한다", () => {
    const manuscript = parsePublicContentManuscript(
      "/tmp/blog-yeon-engineering-engineering--escaped.md",
      [
        "---",
        'schema_version: "1"',
        'title: "인용 \\"제목\\"과\\n줄바꿈"',
        'description: "Windows 경로 C:\\\\docs\\\\content"',
        'summary: "escape 왕복을 검증합니다."',
        'channel: "blog"',
        'service: "yeon"',
        'category: "engineering"',
        'slug: "engineering/escaped"',
        'status: "draft"',
        'visibility: "public"',
        'noindex: "false"',
        'author_key: "yeon"',
        'source_repo: "yeon"',
        "source_path:",
        '  - "docs/path\\\\with\\\\backslash.md"',
        'content_version: "7"',
        "---",
        "",
        "## 본문",
        "",
        "내용입니다.",
      ].join("\n")
    );

    expect(manuscript.frontmatter.title).toBe('인용 "제목"과\n줄바꿈');
    expect(manuscript.frontmatter.description).toBe(
      "Windows 경로 C:\\docs\\content"
    );
    expect(manuscript.frontmatter.source_path).toEqual([
      "docs/path\\with\\backslash.md",
    ]);
    expect(manuscript.frontmatter.content_version).toBe("7");
    expect(manuscript.body).toBe("## 본문\n\n내용입니다.");
  });

  it("빈 source_path와 unquoted boolean을 기존 계약 문자열로 정규화한다", () => {
    const manuscript = parsePublicContentManuscript(
      "/tmp/support-nexa-guides-nexa--guides--empty-source.md",
      [
        "---",
        "title: 빈 출처 경로",
        "description: 기존 원고 형식도 읽습니다.",
        "channel: support",
        "service: nexa",
        "category: guides",
        "slug: nexa/guides/empty-source",
        "status: draft",
        "noindex: false",
        "source_repo: yeon",
        "source_path: []",
        "---",
        "",
        "본문입니다.",
      ].join("\n")
    );

    expect(manuscript.frontmatter.noindex).toBe("false");
    expect(manuscript.frontmatter.source_path).toEqual([]);
  });
});
