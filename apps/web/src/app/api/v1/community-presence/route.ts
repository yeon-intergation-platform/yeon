import { NextResponse } from "next/server";

const ACTIVE_WINDOW_MS = 30_000;
const MAX_SESSION_ID_LENGTH = 120;

type PresenceRecord = {
  lastSeenAt: number;
};

type PresenceStore = Map<string, PresenceRecord>;

const globalForPresence = globalThis as typeof globalThis & {
  yeonCommunityPresence?: PresenceStore;
};

const presenceStore =
  globalForPresence.yeonCommunityPresence ??
  (globalForPresence.yeonCommunityPresence = new Map());

function cleanupExpired(now: number) {
  for (const [sessionId, record] of presenceStore.entries()) {
    if (now - record.lastSeenAt > ACTIVE_WINDOW_MS) {
      presenceStore.delete(sessionId);
    }
  }
}

function normalizeSessionId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, MAX_SESSION_ID_LENGTH);
}

function createPresenceResponse(now = Date.now()) {
  cleanupExpired(now);
  return NextResponse.json({ activeCount: presenceStore.size });
}

export function GET() {
  return createPresenceResponse();
}

export async function POST(request: Request) {
  const now = Date.now();

  try {
    const body = (await request.json()) as {
      sessionId?: unknown;
      active?: unknown;
    };
    const sessionId = normalizeSessionId(body.sessionId);

    if (!sessionId) {
      return createPresenceResponse(now);
    }

    if (body.active === false) {
      presenceStore.delete(sessionId);
    } else {
      presenceStore.set(sessionId, { lastSeenAt: now });
    }

    return createPresenceResponse(now);
  } catch {
    return createPresenceResponse(now);
  }
}
