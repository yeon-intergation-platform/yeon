import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createRandomCommunityGuestNickname,
  readCommunityGuestNickname,
  resolveCommunityGuestNickname,
  writeCommunityGuestNickname,
} from "../community-guest-identity";
import {
  canSkipCommunityGuestIdentityConfirm,
  COMMUNITY_GUEST_IDENTITY_CONFIRM_DISMISSED_KEY,
  hasCompleteCommunityGuestIdentity,
} from "../community-guest-identity-confirm";

function stubWindowLocalStorage(initialNickname?: string) {
  const storage = new Map<string, string>();
  if (initialNickname) {
    storage.set("yeon-community-guest-nickname", initialNickname);
  }

  const localStorage = {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
  };

  vi.stubGlobal("window", { localStorage });
  return localStorage;
}

describe("community guest identity", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("익명과 4자리 숫자로 기본 닉네임을 만든다", () => {
    expect(createRandomCommunityGuestNickname()).toMatch(/^익명\d{4}$/);
  });

  it("저장된 게스트 닉네임이 없으면 새 닉네임을 저장하고 재사용한다", () => {
    const localStorage = stubWindowLocalStorage();

    const nickname = readCommunityGuestNickname();

    expect(nickname).toMatch(/^익명\d{4}$/);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "yeon-community-guest-nickname",
      nickname
    );
    expect(readCommunityGuestNickname()).toBe(nickname);
  });

  it("저장된 게스트 닉네임이 있으면 그대로 사용한다", () => {
    const localStorage = stubWindowLocalStorage("익명1234");

    expect(readCommunityGuestNickname()).toBe("익명1234");
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("커뮤니티에서 설정한 닉네임을 저장하고 채팅 닉네임으로 재사용한다", () => {
    const localStorage = stubWindowLocalStorage();

    writeCommunityGuestNickname("  상담익명  ");

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "yeon-community-guest-nickname",
      "상담익명"
    );
    expect(readCommunityGuestNickname()).toBe("상담익명");
    expect(resolveCommunityGuestNickname()).toBe("상담익명");
  });

  it("전달받은 닉네임이 있으면 저장소 값보다 우선한다", () => {
    stubWindowLocalStorage("익명1234");

    expect(resolveCommunityGuestNickname("  새닉네임  ")).toBe("새닉네임");
  });

  it("닉네임과 비밀번호가 모두 있을 때만 게스트 작성자 정보가 완성된다", () => {
    expect(
      hasCompleteCommunityGuestIdentity({
        guestNickname: " 익명1234 ",
        guestPassword: " pw ",
      })
    ).toBe(true);
    expect(
      hasCompleteCommunityGuestIdentity({
        guestNickname: "익명1234",
        guestPassword: " ",
      })
    ).toBe(false);
  });

  it("다시 보지 않음 상태여도 비밀번호가 비어 있으면 작성자 확인을 건너뛰지 않는다", () => {
    const localStorage = stubWindowLocalStorage("테스터");
    localStorage.setItem(
      COMMUNITY_GUEST_IDENTITY_CONFIRM_DISMISSED_KEY,
      "true"
    );

    expect(
      canSkipCommunityGuestIdentityConfirm({
        guestNickname: "테스터",
        guestPassword: "",
      })
    ).toBe(false);
    expect(
      canSkipCommunityGuestIdentityConfirm({
        guestNickname: "테스터",
        guestPassword: "pw",
      })
    ).toBe(true);
  });
});
