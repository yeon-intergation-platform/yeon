import {
  sendCommunityPresenceHeartbeat,
  sendCommunityPresenceLeaveBeacon,
} from "./community-presence-api";

const COMMUNITY_PRESENCE_SESSION_STORAGE_KEY =
  "yeon-community-presence-session";

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

export const sendPresenceHeartbeat = sendCommunityPresenceHeartbeat;

export const sendPresenceLeave = sendCommunityPresenceLeaveBeacon;
