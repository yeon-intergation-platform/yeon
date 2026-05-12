const COMMUNITY_GUEST_NICKNAME_STORAGE_KEY = "yeon-community-guest-nickname";
const COMMUNITY_GUEST_NICKNAME_PREFIX = "익명";
const RANDOM_SUFFIX_MODULO = 10_000;

function createRandomFourDigitSuffix() {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject && typeof cryptoObject.getRandomValues === "function") {
    const randomValues = new Uint32Array(1);
    cryptoObject.getRandomValues(randomValues);
    return ((randomValues[0] ?? 0) % RANDOM_SUFFIX_MODULO)
      .toString()
      .padStart(4, "0");
  }

  return Math.floor(Math.random() * RANDOM_SUFFIX_MODULO)
    .toString()
    .padStart(4, "0");
}

export function createRandomCommunityGuestNickname() {
  return `${COMMUNITY_GUEST_NICKNAME_PREFIX}${createRandomFourDigitSuffix()}`;
}

export function readCommunityGuestNickname() {
  if (typeof window === "undefined") {
    return createRandomCommunityGuestNickname();
  }

  try {
    const savedNickname = window.localStorage
      .getItem(COMMUNITY_GUEST_NICKNAME_STORAGE_KEY)
      ?.trim();

    if (savedNickname) {
      return savedNickname;
    }

    const createdNickname = createRandomCommunityGuestNickname();
    window.localStorage.setItem(
      COMMUNITY_GUEST_NICKNAME_STORAGE_KEY,
      createdNickname
    );
    return createdNickname;
  } catch {
    return createRandomCommunityGuestNickname();
  }
}
