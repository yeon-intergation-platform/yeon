import {
  createYeonRandomUUID,
  getYeonNow,
  getYeonRandom,
  readYeonSessionStorageItem,
  removeYeonSessionStorageItem,
  writeYeonSessionStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  sendCommunityPresenceHeartbeat,
  sendCommunityPresenceLeaveBeacon,
} from "./community-presence-api";

const COMMUNITY_PRESENCE_SESSION_STORAGE_KEY =
  "yeon-community-presence-session";
const COMMUNITY_PRESENCE_SESSION_PREFIX = "presence-";
const COMMUNITY_PRESENCE_SESSION_ID_MIN_LENGTH =
  COMMUNITY_PRESENCE_SESSION_PREFIX.length + 8;

function createFallbackRandomId() {
  return getYeonRandom().toString(36).slice(2, 10);
}

function createPresenceSessionId() {
  const randomId = createYeonRandomUUID() ?? createFallbackRandomId();

  return `${COMMUNITY_PRESENCE_SESSION_PREFIX}${randomId}-${getYeonNow()}`;
}

export function isValidPresenceSessionId(sessionId: string | null | undefined) {
  const normalized = sessionId?.trim() ?? "";

  return (
    normalized.length >= COMMUNITY_PRESENCE_SESSION_ID_MIN_LENGTH &&
    normalized.startsWith(COMMUNITY_PRESENCE_SESSION_PREFIX) &&
    !/\s/.test(normalized)
  );
}

export function readPresenceSessionId() {
  const saved = readYeonSessionStorageItem(
    COMMUNITY_PRESENCE_SESSION_STORAGE_KEY
  );
  const normalizedSaved = saved?.trim() ?? "";
  if (isValidPresenceSessionId(normalizedSaved)) {
    return normalizedSaved;
  }
  if (normalizedSaved) {
    removeYeonSessionStorageItem(COMMUNITY_PRESENCE_SESSION_STORAGE_KEY);
  }

  const created = createPresenceSessionId();
  writeYeonSessionStorageItem(COMMUNITY_PRESENCE_SESSION_STORAGE_KEY, created);
  return created;
}

export const sendPresenceHeartbeat = sendCommunityPresenceHeartbeat;

export const sendPresenceLeave = sendCommunityPresenceLeaveBeacon;
