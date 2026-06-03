import {
  getYeonOptionalLocalStorage,
  getYeonSecureStorage,
} from "@yeon/ui/native";

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
  const existing = await readItem(GUEST_ID_KEY);
  if (existing) {
    return existing;
  }
  const next = randomGuestId();
  await writeItem(GUEST_ID_KEY, next);
  return next;
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
