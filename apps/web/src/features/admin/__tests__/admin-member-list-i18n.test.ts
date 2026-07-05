import { describe, expect, it } from "vitest";
import { getAdminMemberListText } from "../admin-member-list-i18n";

const HANGUL_PATTERN = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;

describe("admin-member-list i18n", () => {
  it("영어 회원관리 문구에는 한국어가 섞이지 않는다", () => {
    const text = getAdminMemberListText("en");
    const values = [
      text.noName,
      text.stats.total,
      text.stats.admin,
      text.stats.activeSessions,
      text.stats.serviceData,
      text.heading,
      text.description,
      text.searchPlaceholder,
      text.allRoles,
      text.empty,
      text.columns.member,
      text.columns.displayName,
      text.columns.role,
      text.columns.data,
      text.columns.lastLogin,
      text.columns.actions,
      text.joinedAt("Jan 1, 2026, 1:00 PM"),
      text.save,
      text.sessionSummary("1"),
      text.sessionSummary("2"),
      text.dataSummary("1", "2"),
      text.noProviders,
      text.emailVerified("Jan 1, 2026, 1:00 PM"),
      text.invalidateSessions,
      text.delete,
      text.selfDeleteTitle,
      text.deleteTitle,
      text.deletePrompt("user@example.com"),
      text.saveNameFailed,
      text.saveNameSuccess,
      text.roleFailed,
      text.roleSuccess,
      text.sessionsFailed,
      text.sessionsSuccess("1"),
      text.sessionsSuccess("2"),
      text.deleteFailed,
      text.deleteSuccess,
    ];

    expect(values.join(" ")).not.toMatch(HANGUL_PATTERN);
  });
});
