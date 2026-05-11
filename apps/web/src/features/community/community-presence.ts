const COMMUNITY_PRESENCE_SESSION_STORAGE_KEY =
  "yeon-community-presence-session";
export const COMMUNITY_PRESENCE_API_PATH = "/api/v1/community-presence";

function createFallbackRandomId() {
  return Math.random().toString(36).slice(2, 10);
}

function createPresenceSessionId() {
  const randomId =
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : createFallbackRandomId();

  return `presence-${randomId}-${Date.now()}`;
}

export function readPresenceSessionId() {
  if (typeof window === "undefined") {
    return createPresenceSessionId();
  }

  const saved = window.sessionStorage.getItem(
    COMMUNITY_PRESENCE_SESSION_STORAGE_KEY
  );
  if (saved?.trim()) {
    return saved;
  }

  const created = createPresenceSessionId();
  window.sessionStorage.setItem(
    COMMUNITY_PRESENCE_SESSION_STORAGE_KEY,
    created
  );
  return created;
}

export async function sendPresenceHeartbeat(sessionId: string, active = true) {
  const response = await fetch(COMMUNITY_PRESENCE_API_PATH, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId, active }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("접속 상태를 갱신하지 못했습니다.");
  }

  return (await response.json()) as { activeCount?: number };
}

export function sendPresenceLeave(sessionId: string) {
  const payload = JSON.stringify({ sessionId, active: false });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      COMMUNITY_PRESENCE_API_PATH,
      new Blob([payload], { type: "application/json" })
    );
    return;
  }

  void sendPresenceHeartbeat(sessionId, false);
}
