import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildSpaceExportData, extractSheetId } from "../../sheet-export-bff";
import { fetchSheetExportRowsFromSpring } from "@/server/sheet-export-spring-client";

vi.mock("@/server/sheet-export-spring-client", () => ({
  fetchSheetExportRowsFromSpring: vi.fn(),
  fetchSheetExportSnapshotsFromSpring: vi.fn(),
  replaceSheetExportSnapshotsInSpring: vi.fn(),
}));

describe("google-sheets-export-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("정상 구글 시트 URL에서 sheet id를 추출한다", () => {
    expect(
      extractSheetId(
        "https://docs.google.com/spreadsheets/d/abc123_DEF-456/edit#gid=0"
      )
    ).toBe("abc123_DEF-456");
  });

  it("시트 ID를 추출할 수 없는 URL이면 400을 던진다", () => {
    expect(() =>
      extractSheetId("https://docs.google.com/document/d/abc/edit")
    ).toThrow();
  });

  it("Spring export rows 응답을 sheet values 형식으로 변환한다", async () => {
    vi.mocked(fetchSheetExportRowsFromSpring).mockResolvedValue({
      fieldDefinitions: [
        { id: "mfd_status", name: "상태", fieldType: "select" },
        { id: "mfd_note", name: "메모", fieldType: "text" },
      ],
      rows: [
        {
          memberId: "mem_1",
          values: [
            "홍길동",
            "hong@example.com",
            "010-1111-2222",
            "수강중",
            "보통",
            "2026-05-01",
            "in_progress",
            "메모값",
          ],
          payload: {
            core: {
              name: "홍길동",
              email: "hong@example.com",
              phone: "010-1111-2222",
              status: "active",
              initialRiskLevel: "medium",
            },
            customFields: {
              상태: "in_progress",
              메모: "메모값",
            },
          },
        },
      ],
    });

    const result = await buildSpaceExportData("space_alpha", "user_1");

    expect(fetchSheetExportRowsFromSpring).toHaveBeenCalledWith(
      "space_alpha",
      "user_1"
    );
    expect(result.memberCount).toBe(1);
    expect(result.rows).toEqual([
      {
        memberId: "mem_1",
        values: [
          "홍길동",
          "hong@example.com",
          "010-1111-2222",
          "수강중",
          "보통",
          "2026-05-01",
          "in_progress",
          "메모값",
        ],
        payload: {
          core: {
            name: "홍길동",
            email: "hong@example.com",
            phone: "010-1111-2222",
            status: "active",
            initialRiskLevel: "medium",
          },
          customFields: {
            상태: "in_progress",
            메모: "메모값",
          },
        },
      },
    ]);
    expect(result.values[0]).toEqual([
      "이름",
      "이메일",
      "전화번호",
      "수강 상태",
      "위험도",
      "등록일",
      "상태",
      "메모",
      "__yeon_member_id",
      "__yeon_exported_at",
    ]);
    expect(result.values[1]?.slice(0, 9)).toEqual([
      "홍길동",
      "hong@example.com",
      "010-1111-2222",
      "수강중",
      "보통",
      "2026-05-01",
      "in_progress",
      "메모값",
      "mem_1",
    ]);
    expect(result.values[1]?.[9]).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );
  });
});
