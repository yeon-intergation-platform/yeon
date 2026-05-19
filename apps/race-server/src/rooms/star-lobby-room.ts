import { type Client, Room } from "@colyseus/core";
import {
  STAR_LOBBY_EVENTS,
  STAR_LOBBY_LIVE_EVENT_TYPE,
  type StarLobbyRealtimeEvent,
  type StarLobbyRealtimeJoinOptions,
  type StarLobbyRealtimeRecipient,
  type StarLobbySubscribeMessage,
} from "@yeon/race-shared";

type ClientSubscription = Required<StarLobbySubscribeMessage> &
  StarLobbyRealtimeRecipient;
type JsonObject = Record<string, unknown>;

const activeRooms = new Set<StarLobbyRoom>();
const MAX_KEYWORDS = 20;
const MAX_KEYWORD_LENGTH = 80;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeKeywords(value: unknown) {
  if (!Array.isArray(value)) return [];
  const keywords: string[] = [];
  for (const item of value) {
    const keyword = optionalString(item);
    if (!keyword) continue;
    const sliced = keyword.slice(0, MAX_KEYWORD_LENGTH);
    if (!keywords.includes(sliced)) keywords.push(sliced);
    if (keywords.length >= MAX_KEYWORDS) break;
  }
  return keywords;
}

function normalizeSubscription(
  value: Partial<StarLobbyRealtimeJoinOptions> | StarLobbySubscribeMessage
): ClientSubscription {
  const object = value as Partial<StarLobbyRealtimeJoinOptions>;
  return {
    ownerUserId: optionalString(object.ownerUserId),
    guestSessionId: optionalString(object.guestSessionId),
    includeKeywords: normalizeKeywords(value.includeKeywords),
    excludeKeywords: normalizeKeywords(value.excludeKeywords),
  };
}

function normalizeComparable(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "").trim();
}

function matchesKeywordSubscription(
  event: StarLobbyRealtimeEvent,
  subscription: ClientSubscription
) {
  if (event.type !== STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_OBSERVED) return false;
  if (subscription.includeKeywords.length === 0) return false;

  const title = normalizeComparable(event.room.title);
  const included = subscription.includeKeywords.some((keyword) =>
    title.includes(normalizeComparable(keyword))
  );
  if (!included) return false;

  return !subscription.excludeKeywords.some((keyword) =>
    title.includes(normalizeComparable(keyword))
  );
}

function matchesRecipient(
  recipient: StarLobbyRealtimeRecipient | undefined,
  subscription: ClientSubscription
) {
  const ownerUserId = optionalString(recipient?.ownerUserId);
  const guestSessionId = optionalString(recipient?.guestSessionId);
  if (!ownerUserId && !guestSessionId) return false;
  return (
    (ownerUserId !== null && ownerUserId === subscription.ownerUserId) ||
    (guestSessionId !== null && guestSessionId === subscription.guestSessionId)
  );
}

function eventName(event: StarLobbyRealtimeEvent) {
  if (event.type === STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_OBSERVED) {
    return STAR_LOBBY_EVENTS.ROOM_OBSERVED;
  }
  if (event.type === STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_DISAPPEARED) {
    return STAR_LOBBY_EVENTS.ROOM_DISAPPEARED;
  }
  return STAR_LOBBY_EVENTS.ALERT_MATCHED;
}

export function parseStarLobbyRealtimeEvent(
  payload: unknown
): StarLobbyRealtimeEvent | null {
  if (!isObject(payload)) return null;
  if (
    payload.type !== STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_OBSERVED &&
    payload.type !== STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_DISAPPEARED &&
    payload.type !== STAR_LOBBY_LIVE_EVENT_TYPE.ALERT_MATCHED
  ) {
    return null;
  }
  if (!isObject(payload.room) || !optionalString(payload.room.title)) {
    return null;
  }
  if (payload.type === STAR_LOBBY_LIVE_EVENT_TYPE.ALERT_MATCHED) {
    if (!isObject(payload.match) || !isObject(payload.rule)) return null;
  }
  return payload as StarLobbyRealtimeEvent;
}

export function publishStarLobbyRealtimeEvent(event: StarLobbyRealtimeEvent) {
  let deliveredClients = 0;
  for (const room of activeRooms) {
    deliveredClients += room.publish(event);
  }
  return {
    activeRooms: activeRooms.size,
    deliveredClients,
  };
}

export class StarLobbyRoom extends Room {
  private readonly subscriptions = new Map<string, ClientSubscription>();

  onCreate() {
    activeRooms.add(this);
    this.onMessage(STAR_LOBBY_EVENTS.SUBSCRIBE, (client, payload) => {
      if (!isObject(payload)) {
        client.send(STAR_LOBBY_EVENTS.ERROR, {
          message: "스타 로비 알림 조건 형식이 올바르지 않습니다.",
        });
        return;
      }
      const current =
        this.subscriptions.get(client.sessionId) ?? normalizeSubscription({});
      this.subscriptions.set(
        client.sessionId,
        normalizeSubscription({ ...current, ...payload })
      );
    });
  }

  onJoin(client: Client, options: Partial<StarLobbyRealtimeJoinOptions>) {
    this.subscriptions.set(client.sessionId, normalizeSubscription(options));
  }

  onLeave(client: Client) {
    this.subscriptions.delete(client.sessionId);
    if (this.clients.length === 0) {
      activeRooms.delete(this);
    }
  }

  onDispose() {
    activeRooms.delete(this);
  }

  publish(event: StarLobbyRealtimeEvent) {
    let deliveredClients = 0;
    const name = eventName(event);
    for (const client of this.clients) {
      const subscription = this.subscriptions.get(client.sessionId);
      if (!subscription) continue;
      if (event.type === STAR_LOBBY_LIVE_EVENT_TYPE.ALERT_MATCHED) {
        if (!matchesRecipient(event.recipient, subscription)) continue;
      }
      client.send(name, event);
      deliveredClients += 1;
      if (matchesKeywordSubscription(event, subscription)) {
        client.send(STAR_LOBBY_EVENTS.ALERT_MATCHED, {
          type: STAR_LOBBY_LIVE_EVENT_TYPE.ALERT_MATCHED,
          room: event.room,
          match: {
            id: `local-${event.room.id}-${client.sessionId}`,
            ruleId: "local-keyword-subscription",
            roomId: event.room.id,
            status: "matched",
            matchedKeyword:
              subscription.includeKeywords.find((keyword) =>
                normalizeComparable(event.room.title).includes(
                  normalizeComparable(keyword)
                )
              ) ?? null,
            suppressedKeyword: null,
            matchedAt: event.room.lastSeenAt,
          },
          rule: {
            id: "local-keyword-subscription",
            name: "접속 중 키워드 알림",
            includeKeywords: subscription.includeKeywords,
            excludeKeywords: subscription.excludeKeywords,
            minPlayers: null,
            maxPlayers: null,
            enabled: true,
            createdAt: event.room.lastSeenAt,
            updatedAt: event.room.lastSeenAt,
          },
        });
      }
    }
    return deliveredClients;
  }
}
