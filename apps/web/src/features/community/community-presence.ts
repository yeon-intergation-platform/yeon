import {
  createYeonRandomUUID,
  getYeonNow,
  getYeonRandom,
  readYeonSessionStorageItem,
  writeYeonSessionStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  sendCommunityPresenceHeartbeat,
  sendCommunityPresenceLeaveBeacon,
} from "./community-presence-api";

const COMMUNITY_PRESENCE_SESSION_STORAGE_KEY =
  "yeon-community-presence-session";

function createFallbackRandomId() {
  return getYeonRandom().toString(36).slice(2, 10);
}

function createPresenceSessionId() {
  const randomId = createYeonRandomUUID() ?? createFallbackRandomId();

  return `presence-${randomId}-${getYeonNow()}`;
}

export function readPresenceSessionId() {
  const saved = readYeonSessionStorageItem(
    COMMUNITY_PRESENCE_SESSION_STORAGE_KEY
  );
  if (saved?.trim()) {
    return saved;
  }

  const created = createPresenceSessionId();
  writeYeonSessionStorageItem(COMMUNITY_PRESENCE_SESSION_STORAGE_KEY, created);
  return created;
}

export const sendPresenceHeartbeat = sendCommunityPresenceHeartbeat;

export const sendPresenceLeave = sendCommunityPresenceLeaveBeacon;
