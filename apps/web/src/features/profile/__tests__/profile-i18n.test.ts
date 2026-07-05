import { describe, expect, it } from "vitest";
import { getProfileText } from "../profile-i18n";

const HANGUL_PATTERN = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;

describe("profile-i18n", () => {
  it("영어 프로필 화면 문구에는 한국어가 섞이지 않는다", () => {
    const text = getProfileText("en");
    const values = [
      text.metadataTitle,
      text.metadataDescription,
      text.brandLabel,
      text.eyebrow,
      text.title,
      text.email,
      text.providers,
      text.lastLogin,
      text.loginRequired,
      text.loginAction,
      text.sessionErrorTitle,
      text.sessionErrorDescription,
      text.cleanupAction,
      text.edit.title,
      text.edit.description,
      text.edit.changePhoto,
      text.edit.removePhoto,
      text.edit.save,
      text.edit.uploadFailed,
      text.edit.saveFailed,
      text.edit.saveOk,
      text.experience.levelHeading,
      text.experience.historyHeading,
      text.experience.loadError,
      text.experience.historyLoadError,
      text.experience.emptyHistory,
      ...Object.values(text.experience.activityLabels),
      text.danger.title,
      text.danger.description,
      text.danger.confirmationLabel,
      text.danger.confirmationPlaceholder,
      text.danger.confirmationValue,
      text.danger.action,
      text.danger.processing,
      text.danger.required,
      text.danger.failed,
    ];

    expect(values.join(" ")).not.toMatch(HANGUL_PATTERN);
    expect(text.experience.levelAriaLabel(4)).toBe("View level 4 XP");
  });
});
