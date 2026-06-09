import {
  getYeonRandomUint32,
  readYeonLocalStorageItem,
  writeYeonLocalStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

const COMMUNITY_GUEST_NICKNAME_STORAGE_KEY = "yeon-community-guest-nickname";
const COMMUNITY_GUEST_NICKNAME_PREFIX = "익명";
const RANDOM_SUFFIX_MODULO = 10_000;

function createRandomFourDigitSuffix() {
  return (getYeonRandomUint32() % RANDOM_SUFFIX_MODULO)
    .toString()
    .padStart(4, "0");
}

export function createRandomCommunityGuestNickname() {
  return `${COMMUNITY_GUEST_NICKNAME_PREFIX}${createRandomFourDigitSuffix()}`;
}

export function writeCommunityGuestNickname(nickname: string) {
  const normalizedNickname = nickname.trim();
  if (!normalizedNickname) {
    return;
  }

  writeYeonLocalStorageItem(
    COMMUNITY_GUEST_NICKNAME_STORAGE_KEY,
    normalizedNickname
  );
}

export function resolveCommunityGuestNickname(nickname?: string | null) {
  const normalizedNickname = nickname?.trim();
  if (normalizedNickname) {
    return normalizedNickname;
  }

  return readCommunityGuestNickname();
}

export function readCommunityGuestNickname() {
  try {
    const savedNickname = readYeonLocalStorageItem(
      COMMUNITY_GUEST_NICKNAME_STORAGE_KEY
    )?.trim();

    if (savedNickname) {
      return savedNickname;
    }

    const createdNickname = createRandomCommunityGuestNickname();
    writeCommunityGuestNickname(createdNickname);
    return createdNickname;
  } catch (error) {
    console.warn(
      "[CommunityGuestIdentity] 게스트 닉네임 저장소 접근 실패 — 임시 닉네임을 생성합니다.",
      error
    );
    return createRandomCommunityGuestNickname();
  }
}
