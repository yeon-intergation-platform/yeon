import { afterEach, describe, expect, it, vi } from "vitest";
import { readJsonProfile } from "./use-card-room-profile";

function installLocalStorage(initial: Record<string, string>) {
  const values = new Map(Object.entries(initial));
  vi.stubGlobal("window", {
    localStorage: {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      removeItem: vi.fn((key: string) => {
        values.delete(key);
      }),
      setItem: vi.fn((key: string, value: string) => {
        values.set(key, value);
      }),
    },
    sessionStorage: {
      getItem: vi.fn(() => null),
      removeItem: vi.fn(),
      setItem: vi.fn(),
    },
  });
  return globalThis.window.localStorage;
}

describe("readJsonProfile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("validates stored profile shape before returning it", () => {
    installLocalStorage({
      "profile-key": JSON.stringify({
        nickname: "연",
        characterId: "cat",
      }),
    });

    expect(readJsonProfile("profile-key")).toEqual({
      nickname: "연",
      characterId: "cat",
    });
  });

  it("removes malformed JSON profile and falls back to null", () => {
    const storage = installLocalStorage({ "profile-key": "{" });
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(readJsonProfile("profile-key")).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith("profile-key");
  });

  it("removes schema-invalid profile and falls back to null", () => {
    const storage = installLocalStorage({
      "profile-key": JSON.stringify({ nickname: "", characterId: "" }),
    });
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(readJsonProfile("profile-key")).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith("profile-key");
  });
});
