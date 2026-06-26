import {
  getYeonRandomUint32,
  readYeonLocalStorageItem,
  removeYeonLocalStorageItem,
  writeYeonLocalStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

const COMMUNITY_GUEST_NICKNAME_STORAGE_KEY = "yeon-community-guest-nickname";
const COMMUNITY_GUEST_PASSWORD_STORAGE_KEY = "yeon-community-guest-password";
const COMMUNITY_GUEST_NICKNAME_PREFIX = "익명";
const RANDOM_SUFFIX_MODULO = 10_000;

function createRandomFourDigitSuffix() {
  return (getYeonRandomUint32() % RANDOM_SUFFIX_MODULO)
    .toString()
    .padStart(4, "0");
}

function warnCommunityGuestIdentityStorageFailure(
  context: string,
  error: unknown
) {
  console.warn(`[CommunityGuestIdentity] ${context}`, error);
}

function readCommunityGuestIdentityStorageValue(key: string, context: string) {
  try {
    return readYeonLocalStorageItem(key)?.trim() ?? "";
  } catch (error) {
    warnCommunityGuestIdentityStorageFailure(context, error);
    return "";
  }
}

function writeCommunityGuestIdentityStorageValue(
  key: string,
  value: string,
  context: string
) {
  try {
    writeYeonLocalStorageItem(key, value);
  } catch (error) {
    warnCommunityGuestIdentityStorageFailure(context, error);
  }
}

function removeCommunityGuestIdentityStorageValue(
  key: string,
  context: string
) {
  try {
    removeYeonLocalStorageItem(key);
  } catch (error) {
    warnCommunityGuestIdentityStorageFailure(context, error);
  }
}

export function createRandomCommunityGuestNickname() {
  return `${COMMUNITY_GUEST_NICKNAME_PREFIX}${createRandomFourDigitSuffix()}`;
}

export function writeCommunityGuestNickname(nickname: string) {
  const normalizedNickname = nickname.trim();
  if (!normalizedNickname) {
    return;
  }

  writeCommunityGuestIdentityStorageValue(
    COMMUNITY_GUEST_NICKNAME_STORAGE_KEY,
    normalizedNickname,
    "게스트 닉네임 저장 실패"
  );
}

export function writeCommunityGuestPassword(password: string) {
  const normalizedPassword = password.trim();
  if (!normalizedPassword) {
    removeCommunityGuestIdentityStorageValue(
      COMMUNITY_GUEST_PASSWORD_STORAGE_KEY,
      "게스트 비밀번호 삭제 실패"
    );
    return;
  }

  writeCommunityGuestIdentityStorageValue(
    COMMUNITY_GUEST_PASSWORD_STORAGE_KEY,
    normalizedPassword,
    "게스트 비밀번호 저장 실패"
  );
}

export function resolveCommunityGuestNickname(nickname?: string | null) {
  const normalizedNickname = nickname?.trim();
  if (normalizedNickname) {
    return normalizedNickname;
  }

  return readCommunityGuestNickname();
}

export function readCommunityGuestPassword() {
  return readCommunityGuestIdentityStorageValue(
    COMMUNITY_GUEST_PASSWORD_STORAGE_KEY,
    "게스트 비밀번호 저장소 접근 실패 — 저장된 비밀번호를 사용하지 않습니다."
  );
}

export function readCommunityGuestNickname() {
  const savedNickname = readCommunityGuestIdentityStorageValue(
    COMMUNITY_GUEST_NICKNAME_STORAGE_KEY,
    "게스트 닉네임 저장소 접근 실패 — 임시 닉네임을 생성합니다."
  );

  if (savedNickname) {
    return savedNickname;
  }

  const createdNickname = createRandomCommunityGuestNickname();
  writeCommunityGuestNickname(createdNickname);
  return createdNickname;
}
