import {
  getYeonOptionalLocalStorage,
  getYeonSecureStorage,
} from "@yeon/ui/native";

// 첫 진입 게이트에서 "비회원으로 사용하기"를 고른 적이 있는지 기억하는 플래그.
// 로그인 토큰과 별개 — 게스트 선택을 기억해 다음 실행부터는 게이트를 건너뛰고 바로 홈.
const CARD_GUEST_OPT_IN_KEY = "yeon.card-service.guest-opted-in";
const OPT_IN_VALUE = "1";
const inMemoryStorage = new Map<string, string>();

function getBrowserStorage() {
  return getYeonOptionalLocalStorage();
}

export async function readCardGuestOptIn(): Promise<boolean> {
  const secureStorage = getYeonSecureStorage();

  if (secureStorage) {
    const value = await secureStorage.getItemAsync(CARD_GUEST_OPT_IN_KEY);
    return value === OPT_IN_VALUE;
  }

  const browserStorage = getBrowserStorage();

  if (browserStorage) {
    try {
      return browserStorage.getItem(CARD_GUEST_OPT_IN_KEY) === OPT_IN_VALUE;
    } catch {
      return inMemoryStorage.get(CARD_GUEST_OPT_IN_KEY) === OPT_IN_VALUE;
    }
  }

  return inMemoryStorage.get(CARD_GUEST_OPT_IN_KEY) === OPT_IN_VALUE;
}

export async function writeCardGuestOptIn(): Promise<void> {
  const secureStorage = getYeonSecureStorage();

  if (secureStorage) {
    await secureStorage.setItemAsync(CARD_GUEST_OPT_IN_KEY, OPT_IN_VALUE);
    return;
  }

  const browserStorage = getBrowserStorage();

  if (browserStorage) {
    try {
      browserStorage.setItem(CARD_GUEST_OPT_IN_KEY, OPT_IN_VALUE);
      return;
    } catch {
      inMemoryStorage.set(CARD_GUEST_OPT_IN_KEY, OPT_IN_VALUE);
      return;
    }
  }

  inMemoryStorage.set(CARD_GUEST_OPT_IN_KEY, OPT_IN_VALUE);
}

export async function clearCardGuestOptIn(): Promise<void> {
  const secureStorage = getYeonSecureStorage();

  if (secureStorage) {
    await secureStorage.deleteItemAsync(CARD_GUEST_OPT_IN_KEY);
    return;
  }

  const browserStorage = getBrowserStorage();

  if (browserStorage) {
    try {
      browserStorage.removeItem(CARD_GUEST_OPT_IN_KEY);
    } finally {
      inMemoryStorage.delete(CARD_GUEST_OPT_IN_KEY);
    }
    return;
  }

  inMemoryStorage.delete(CARD_GUEST_OPT_IN_KEY);
}
