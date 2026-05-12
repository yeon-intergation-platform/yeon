export const COMMUNITY_PRESENCE_API_PATH = "/api/v1/community-presence";

export async function sendCommunityPresenceHeartbeat(
  sessionId: string,
  active = true
) {
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

export function sendCommunityPresenceLeaveBeacon(sessionId: string) {
  const payload = JSON.stringify({ sessionId, active: false });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      COMMUNITY_PRESENCE_API_PATH,
      new Blob([payload], { type: "application/json" })
    );
    return;
  }

  void sendCommunityPresenceHeartbeat(sessionId, false);
}
