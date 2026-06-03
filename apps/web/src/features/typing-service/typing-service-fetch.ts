import type {
  TypingDeckDetailResponse,
  TypingDeckListResponse,
  TypingDeckPassageResponse,
  TypingDeckResponse,
} from "@yeon/api-contract/typing-decks";
import type { TypingRoomSummary } from "@yeon/race-shared";
import {
  TYPING_RACE_ROOM_NAME,
  TYPING_ROOM_LIFECYCLE,
  TYPING_ROOM_STATUS,
  TYPING_ROOM_VISIBILITY,
} from "@yeon/race-shared";
import {
  fetchYeon,
  type YeonFetchInput,
  type YeonRequestInit,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { FrameSlot } from "./frame-slot";

export type TypingCharacterFrameOverrideItem = {
  characterId: string;
  frameSlots: FrameSlot[];
};

export type TypingCharacterFrameOverrideMap = Record<string, FrameSlot[]>;

async function readErrorMessage(
  response: YeonResponse,
  fallbackErrorMessage: string
): Promise<string> {
  const text = await response.text().catch(() => "");
  if (!text) return fallbackErrorMessage;

  try {
    const parsed = JSON.parse(text) as { message?: string };
    return parsed.message || fallbackErrorMessage;
  } catch {
    return fallbackErrorMessage;
  }
}

export async function typingServiceFetchJson<T>(
  input: YeonFetchInput,
  init: YeonRequestInit,
  fallbackErrorMessage: string
): Promise<T> {
  const response = await fetchYeon(input, { credentials: "include", ...init });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallbackErrorMessage));
  }

  return (await response.json()) as T;
}

export async function typingServiceFetchVoid(
  input: YeonFetchInput,
  init: YeonRequestInit,
  fallbackErrorMessage: string
): Promise<void> {
  const response = await fetchYeon(input, { credentials: "include", ...init });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallbackErrorMessage));
  }
}

export async function loadTypingDeckList(
  path: string
): Promise<TypingDeckListResponse> {
  return typingServiceFetchJson<TypingDeckListResponse>(
    path,
    { method: "GET" },
    "타자 덱 목록을 불러오지 못했습니다."
  );
}

export async function loadTypingDeckDetail(
  path: string
): Promise<TypingDeckDetailResponse> {
  return typingServiceFetchJson<TypingDeckDetailResponse>(
    path,
    { method: "GET" },
    "타자 덱을 불러오지 못했습니다."
  );
}

export async function requestTypingDeck(
  path: string,
  init: YeonRequestInit,
  fallbackErrorMessage: string
): Promise<TypingDeckResponse> {
  return typingServiceFetchJson<TypingDeckResponse>(
    path,
    init,
    fallbackErrorMessage
  );
}

export async function requestTypingDeckPassage(
  path: string,
  init: YeonRequestInit,
  fallbackErrorMessage: string
): Promise<TypingDeckPassageResponse> {
  return typingServiceFetchJson<TypingDeckPassageResponse>(
    path,
    init,
    fallbackErrorMessage
  );
}

export async function loadTypingCharacterFrameOverrides(): Promise<
  TypingCharacterFrameOverrideItem[]
> {
  try {
    const data = await typingServiceFetchJson<{
      overrides: TypingCharacterFrameOverrideItem[];
    }>(
      "/api/v1/typing-character-frames",
      { method: "GET" },
      "캐릭터 프레임 설정을 불러오지 못했습니다."
    );
    return data.overrides;
  } catch {
    return [];
  }
}

export async function saveTypingCharacterFrameOverride(
  characterId: string,
  frameSlots: FrameSlot[] | null
): Promise<void> {
  await typingServiceFetchVoid(
    `/api/v1/typing-character-frames/${characterId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frameSlots }),
    },
    "캐릭터 프레임 설정을 저장하지 못했습니다."
  );
}

type AvailableTypingRoom = {
  roomId: string;
  clients: number;
  maxClients: number;
  metadata?: TypingRoomSummary;
};

function toSummary(room: AvailableTypingRoom): TypingRoomSummary | null {
  if (!room.metadata) return null;
  const lifecycle = room.metadata.lifecycle ?? TYPING_ROOM_LIFECYCLE.ACTIVE;

  return {
    ...room.metadata,
    roomId: room.roomId,
    lifecycle,
    currentParticipants: room.clients,
    maxParticipants: room.maxClients,
  };
}

export async function loadPublicWaitingTypingRooms(
  raceServerHttpEndpoint: string
): Promise<TypingRoomSummary[]> {
  const response = await fetchYeon(
    `${raceServerHttpEndpoint}/rooms/${TYPING_RACE_ROOM_NAME}`
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const availableRooms = (await response.json()) as AvailableTypingRoom[];
  return availableRooms
    .map(toSummary)
    .filter((room): room is TypingRoomSummary => Boolean(room))
    .filter((room) => room.status === TYPING_ROOM_STATUS.WAITING)
    .filter((room) => room.lifecycle === TYPING_ROOM_LIFECYCLE.ACTIVE)
    .filter((room) => room.currentParticipants > 0)
    .filter((room) => room.visibility === TYPING_ROOM_VISIBILITY.PUBLIC)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function requestTypingRaceSeed(path: string, languageTag: string) {
  return typingServiceFetchJson<unknown>(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languageTag }),
    },
    "레이스 문장을 준비하지 못했습니다."
  );
}
