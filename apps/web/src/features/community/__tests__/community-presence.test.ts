import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionStorage = new Map<string, string>();
const writeYeonSessionStorageItem = vi.fn((key: string, value: string) => {
  sessionStorage.set(key, value);
});
const removeYeonSessionStorageItem = vi.fn((key: string) => {
  sessionStorage.delete(key);
});

vi.mock("@yeon/ui/runtime/YeonBrowserRuntime", () => ({
  createYeonRandomUUID: () => "uuid-1234",
  getYeonNow: () => 1234567890,
  getYeonRandom: () => 0.123456789,
  readYeonSessionStorageItem: (key: string) => sessionStorage.get(key) ?? null,
  removeYeonSessionStorageItem,
  writeYeonSessionStorageItem,
}));

vi.mock("../community-presence-api", () => ({
  sendCommunityPresenceHeartbeat: vi.fn(),
  sendCommunityPresenceLeaveBeacon: vi.fn(),
}));

describe("community presence", () => {
  beforeEach(() => {
    sessionStorage.clear();
    removeYeonSessionStorageItem.mockClear();
    writeYeonSessionStorageItem.mockClear();
  });

  it("presence session id는 prefix와 공백 없는 최소 길이를 만족해야 한다", async () => {
    const { isValidPresenceSessionId } = await import("../community-presence");

    expect(isValidPresenceSessionId("presence-uuid-1234-1234567890")).toBe(
      true
    );
    expect(isValidPresenceSessionId("session-uuid-1234")).toBe(false);
    expect(isValidPresenceSessionId("presence-abc def")).toBe(false);
    expect(isValidPresenceSessionId("presence-1")).toBe(false);
  });

  it("저장된 presence session id가 유효하면 재사용한다", async () => {
    const { readPresenceSessionId } = await import("../community-presence");
    sessionStorage.set(
      "yeon-community-presence-session",
      " presence-saved-123456 "
    );

    expect(readPresenceSessionId()).toBe("presence-saved-123456");
    expect(writeYeonSessionStorageItem).not.toHaveBeenCalled();
  });

  it("저장된 presence session id가 유효하지 않으면 새로 발급해 덮어쓴다", async () => {
    const { readPresenceSessionId } = await import("../community-presence");
    sessionStorage.set("yeon-community-presence-session", "legacy-session");

    expect(readPresenceSessionId()).toBe("presence-uuid-1234-1234567890");
    expect(writeYeonSessionStorageItem).toHaveBeenCalledWith(
      "yeon-community-presence-session",
      "presence-uuid-1234-1234567890"
    );
    expect(removeYeonSessionStorageItem).toHaveBeenCalledWith(
      "yeon-community-presence-session"
    );
  });

  it("저장된 presence session id가 공백뿐이면 삭제 없이 새 값만 저장한다", async () => {
    const { readPresenceSessionId } = await import("../community-presence");
    sessionStorage.set("yeon-community-presence-session", "  ");

    expect(readPresenceSessionId()).toBe("presence-uuid-1234-1234567890");
    expect(removeYeonSessionStorageItem).not.toHaveBeenCalled();
  });
});
