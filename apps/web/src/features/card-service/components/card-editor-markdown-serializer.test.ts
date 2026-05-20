import ImageExtension from "@tiptap/extension-image";
import { Table as TableExtension } from "@tiptap/extension-table";
import TableCellExtension from "@tiptap/extension-table-cell";
import TableHeaderExtension from "@tiptap/extension-table-header";
import TableRowExtension from "@tiptap/extension-table-row";
import { getSchema } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Slice } from "@tiptap/pm/model";
import { describe, expect, it } from "vitest";

import { serializeCardEditorSliceToMarkdown } from "./card-editor-markdown-serializer";

const schema = getSchema([
  StarterKit,
  ImageExtension,
  TableExtension.configure({ resizable: true }),
  TableRowExtension,
  TableHeaderExtension,
  TableCellExtension,
]);

function sliceFromContent(content: unknown[]) {
  const doc = schema.nodeFromJSON({ type: "doc", content });
  return Slice.maxOpen(doc.content);
}

describe("card-editor-markdown-serializer", () => {
  it("표 노드를 마크다운 표로 복사한다", () => {
    const slice = sliceFromContent([
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "항목" }],
                  },
                ],
              },
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "설명" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "예시" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "내용" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    expect(serializeCardEditorSliceToMarkdown(slice)).toBe(
      ["| 항목 | 설명 |", "| --- | --- |", "| 예시 | 내용 |"].join("\n")
    );
  });

  it("이미지 노드를 마크다운 이미지 문법으로 복사한다", () => {
    const slice = sliceFromContent([
      {
        type: "image",
        attrs: {
          src: "/api/v1/card-decks/assets/cards/sample.png",
          alt: "샘플 이미지",
        },
      },
    ]);

    expect(serializeCardEditorSliceToMarkdown(slice)).toBe(
      "![샘플 이미지](/api/v1/card-decks/assets/cards/sample.png)"
    );
  });
});
