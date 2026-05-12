import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRandomCommunityGuestNickname,
  readCommunityGuestNickname,
} from "../community-guest-identity";

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
});
