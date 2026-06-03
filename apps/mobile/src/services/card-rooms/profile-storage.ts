import {
  getYeonOptionalLocalStorage,
  getYeonSecureStorage,
} from "@yeon/ui/native";

// idx-118: guestId 생성을 단일 in-flight Promise로 메모이즈해 동시 호출 경합 방지.
let _guestIdInFlight: Promise<string> | null = null;

// 카드방 정체성: 로그인과 무관한 게스트 ID + 표시 프로필(닉네임/캐릭터).
// 서버는 X-Yeon-Guest-Id 헤더 + profile로 참가자를 식별한다(토큰 인증 불필요).
const PROFILE_KEY = "yeon.card-room.profile";
const GUEST_ID_KEY = "yeon.card-room.guest-id";
const DEFAULT_CHARACTER_ID = "camel";

const inMemoryStorage = new Map<string, string>();

export type CardRoomLocalProfile = {
  nickname: string;
  characterId: string;
};

function normalizeProfile(
  source: Partial<CardRoomLocalProfile> | null | undefined
): CardRoomLocalProfile {
  return {
    nickname: source?.nickname?.trim().slice(0, 40) || "게스트",
    characterId: source?.characterId?.trim() || DEFAULT_CHARACTER_ID,
  };
}

async function readItem(key: string): Promise<string | null> {
  const secureStorage = getYeonSecureStorage();
  if (secureStorage) {
    return secureStorage.getItemAsync(key);
  }
  const browserStorage = getYeonOptionalLocalStorage();
  if (browserStorage) {
    try {
      return browserStorage.getItem(key);
    } catch {
      return inMemoryStorage.get(key) ?? null;
    }
  }
  return inMemoryStorage.get(key) ?? null;
}

async function writeItem(key: string, value: string): Promise<void> {
  const secureStorage = getYeonSecureStorage();
  if (secureStorage) {
    await secureStorage.setItemAsync(key, value);
    return;
  }
  const browserStorage = getYeonOptionalLocalStorage();
  if (browserStorage) {
    try {
      browserStorage.setItem(key, value);
      return;
    } catch {
      inMemoryStorage.set(key, value);
      return;
    }
  }
  inMemoryStorage.set(key, value);
}

async function deleteItem(key: string): Promise<void> {
  const secureStorage = getYeonSecureStorage();
  if (secureStorage) {
    await secureStorage.deleteItemAsync(key);
    return;
  }
  const browserStorage = getYeonOptionalLocalStorage();
  if (browserStorage) {
    try {
      browserStorage.removeItem(key);
      return;
    } catch {
      inMemoryStorage.delete(key);
      return;
    }
  }
  inMemoryStorage.delete(key);
}

function randomGuestId() {
  // Date.now/Math.random은 RN에서 사용 가능(워크플로 제약과 무관).
  const rand = Math.random().toString(36).slice(2);
  const stamp = Date.now().toString(36);
  return `guest_${stamp}${rand}`;
}

export async function readCardRoomProfile(): Promise<CardRoomLocalProfile> {
  const raw = await readItem(PROFILE_KEY);
  if (!raw) {
    return normalizeProfile(null);
  }
  try {
    return normalizeProfile(JSON.parse(raw) as Partial<CardRoomLocalProfile>);
  } catch {
    return normalizeProfile(null);
  }
}

export async function writeCardRoomProfile(
  profile: CardRoomLocalProfile
): Promise<CardRoomLocalProfile> {
  const normalized = normalizeProfile(profile);
  await writeItem(PROFILE_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function readCardRoomGuestId(): Promise<string> {
  // idx-118: 단일 in-flight Promise로 메모이즈해 동시 호출 시 서로 다른 guestId 생성 방지.
  if (_guestIdInFlight) return _guestIdInFlight;
  _guestIdInFlight = (async () => {
    const existing = await readItem(GUEST_ID_KEY);
    if (existing) return existing;
    const next = randomGuestId();
    await writeItem(GUEST_ID_KEY, next);
    return next;
  })().finally(() => {
    _guestIdInFlight = null;
  });
  return _guestIdInFlight;
}

// 방별 내 참가자 ID(입장 후 재접속 시 동일 참가자로 연결).
function participantKey(roomId: string) {
  return `yeon.card-room.participant.${roomId}`;
}

export async function readCardRoomParticipantId(
  roomId: string
): Promise<string | null> {
  return readItem(participantKey(roomId));
}

export async function writeCardRoomParticipantId(
  roomId: string,
  participantId: string
): Promise<void> {
  await writeItem(participantKey(roomId), participantId);
}

// idx-112/113: 참가자 ID 삭제(stale ID 복구, 퇴장 시 정리).
export async function deleteCardRoomParticipantId(
  roomId: string
): Promise<void> {
  await deleteItem(participantKey(roomId));
}

// finding 166: race-server 입장 시 participantId 가장을 막기 위한 소유 증명 토큰.
// participantId와 동일 수명으로 보관/정리한다.
function participantTokenKey(roomId: string) {
  return `yeon.card-room.participant-token.${roomId}`;
}

export async function readCardRoomParticipantToken(
  roomId: string
): Promise<string | null> {
  return readItem(participantTokenKey(roomId));
}

export async function writeCardRoomParticipantToken(
  roomId: string,
  participantToken: string
): Promise<void> {
  await writeItem(participantTokenKey(roomId), participantToken);
}

export async function deleteCardRoomParticipantToken(
  roomId: string
): Promise<void> {
  await deleteItem(participantTokenKey(roomId));
}
