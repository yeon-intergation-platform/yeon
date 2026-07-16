import { describe, expect, it } from "vitest";
import {
  getPublicContentMarkdownHeadings,
  publicContentBlocksToMarkdown,
  publicContentMarkdownToBlocks,
} from "./public-content-markdown";

describe("public content Markdown 변환", () => {
  it("기존 block 콘텐츠를 Markdown으로 직렬화한다", () => {
    const markdown = publicContentBlocksToMarkdown([
      { type: "heading", title: "확인 순서" },
      { type: "steps", items: ["첫 단계", "두 번째 단계"] },
      {
        type: "callout",
        tone: "warning",
        title: "주의",
        text: "공개 전에 확인합니다.",
      },
    ]);

    expect(markdown).toContain("## 확인 순서");
    expect(markdown).toContain("1. 첫 단계\n2. 두 번째 단계");
    expect(markdown).toContain("> [!WARNING]");
  });

  it("Markdown heading, checklist, code, callout을 공개 block으로 해석한다", () => {
    const blocks = publicContentMarkdownToBlocks(`## 시작하기

- [ ] 권한 확인

\`\`\`ts
const ready = true;
\`\`\`

> [!TIP]
> **완료**
>
> 공개할 수 있습니다.`);

    expect(blocks).toEqual([
      { type: "heading", title: "시작하기" },
      { type: "checklist", items: ["권한 확인"] },
      { type: "code", language: "ts", code: "const ready = true;" },
      {
        type: "callout",
        title: "완료",
        text: "공개할 수 있습니다.",
        tone: "success",
      },
    ]);
  });

  it("코드 블록을 제외한 heading에 원문 줄 기준의 결정적 id를 부여한다", () => {
    const markdown = `## 시작하기

\`\`\`md
## 코드 안 제목
\`\`\`

### 다음 단계`;

    expect(getPublicContentMarkdownHeadings(markdown)).toEqual([
      { id: "section-1", line: 1, title: "시작하기" },
      { id: "section-2", line: 7, title: "다음 단계" },
    ]);
    expect(getPublicContentMarkdownHeadings(markdown)).toEqual(
      getPublicContentMarkdownHeadings(markdown)
    );
  });

  it("Setext H2도 renderer 시작 줄과 같은 목차 heading으로 읽는다", () => {
    expect(
      getPublicContentMarkdownHeadings(
        "첫 번째 줄\n두 번째 줄\n---\n\n## 다음 단계"
      )
    ).toEqual([
      {
        id: "section-1",
        line: 1,
        title: "첫 번째 줄 두 번째 줄",
      },
      { id: "section-2", line: 5, title: "다음 단계" },
    ]);
  });
});
