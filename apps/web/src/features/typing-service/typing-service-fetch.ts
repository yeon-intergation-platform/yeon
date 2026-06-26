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
  errorResponseSchema,
  type ErrorResponseMeta,
} from "@yeon/api-contract/error";
import {
  fetchYeon,
  type YeonFetchInput,
  type YeonRequestInit,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { FrameSlot } from "./frame-slot";

export class TypingServiceApiError extends Error {
  /** 백엔드 분기용 고정 식별자. 없을 수 있다. */
  public readonly code?: string;
  /** code + 상황별 확장 메타데이터. */
  public readonly detail?: ErrorResponseMeta;

  constructor(
    public readonly status: number,
    message: string,
    detail?: ErrorResponseMeta
  ) {
    super(message);
    this.name = "TypingServiceApiError";
    this.code = detail?.code;
    this.detail = detail;
  }
}

export type TypingCharacterFrameOverrideItem = {
  characterId: string;
  frameSlots: FrameSlot[];
};

export type TypingCharacterFrameOverrideMap = Record<string, FrameSlot[]>;

type TypingServiceErrorBody = {
  message: string;
  detail: ErrorResponseMeta;
};

async function readError(
  response: YeonResponse,
  fallbackErrorMessage: string
): Promise<TypingServiceErrorBody> {
  const text = await response.text().catch((error) => {
    console.warn("[typing-service] 오류 응답 본문을 읽지 못했습니다.", error);
    return "";
  });
  if (!text) return { message: fallbackErrorMessage, detail: {} };

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn("[typing-service] 오류 응답 JSON 파싱 실패", error);
      return { message: fallbackErrorMessage, detail: {} };
    }
    throw error;
  }

  const parsed = errorResponseSchema.safeParse(json);
  if (!parsed.success) {
    return { message: fallbackErrorMessage, detail: {} };
  }

  const { message, ...detail } = parsed.data;
  return { message: message || fallbackErrorMessage, detail };
}

export async function typingServiceFetchJson<T>(
  input: YeonFetchInput,
  init: YeonRequestInit,
  fallbackErrorMessage: string
): Promise<T> {
  const response = await fetchYeon(input, { credentials: "include", ...init });

  if (!response.ok) {
    const { message, detail } = await readError(response, fallbackErrorMessage);
    throw new TypingServiceApiError(response.status, message, detail);
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
    const { message, detail } = await readError(response, fallbackErrorMessage);
    throw new TypingServiceApiError(response.status, message, detail);
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
  } catch (error) {
    console.warn("[typing-service] 캐릭터 프레임 설정 로드 실패", error);
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

function normalizeNonNegativeParticipantCount(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function toSummary(room: AvailableTypingRoom): TypingRoomSummary | null {
  if (!room.metadata) return null;
  const lifecycle = room.metadata.lifecycle ?? TYPING_ROOM_LIFECYCLE.ACTIVE;
  const currentParticipants = normalizeNonNegativeParticipantCount(
    room.clients
  );
  const maxParticipants = normalizeNonNegativeParticipantCount(room.maxClients);

  return {
    ...room.metadata,
    roomId: room.roomId,
    lifecycle,
    currentParticipants,
    maxParticipants,
  };
}

export function isPublicWaitingTypingRoomSummary(
  room: TypingRoomSummary
): boolean {
  return (
    room.status === TYPING_ROOM_STATUS.WAITING &&
    room.lifecycle === TYPING_ROOM_LIFECYCLE.ACTIVE &&
    room.currentParticipants > 0 &&
    room.visibility === TYPING_ROOM_VISIBILITY.PUBLIC
  );
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
    .filter(isPublicWaitingTypingRoomSummary)
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

export type TypingRaceUserToken = {
  userId: string | null;
  userToken: string | null;
};

// 레이스 입장용 로그인 사용자 토큰을 발급받는다(세션 쿠키 기반, credentials: include).
// best-effort: 실패하면 { userId: null, userToken: null } 를 돌려줘 레이스 진행을 절대 깨지 않는다.
// (토큰이 없으면 경험치 적립만 누락된다.) 비로그인도 서버가 null 을 반환한다.
export async function loadTypingRaceUserToken(): Promise<TypingRaceUserToken> {
  try {
    const data = await typingServiceFetchJson<Partial<TypingRaceUserToken>>(
      "/api/v1/typing-races/user-token",
      { method: "GET" },
      "타자 레이스 사용자 토큰을 발급하지 못했습니다."
    );
    return {
      userId: typeof data.userId === "string" ? data.userId : null,
      userToken: typeof data.userToken === "string" ? data.userToken : null,
    };
  } catch (error) {
    console.warn("[typing-service] 레이스 사용자 토큰 발급 실패", error);
    return { userId: null, userToken: null };
  }
}
