import {
  getYeonOptionalLocalStorage,
  getYeonSecureStorage,
} from "@yeon/ui/native";

const PRIMARY_AUTH_SESSION_TOKEN_KEY = "yeon.primary-auth.session-token";
const inMemoryStorage = new Map<string, string>();

// ⚠ 보안 주의(idx=144): Expo web 빌드에서는 getYeonSecureStorage()가 null을 반환하고
// localStorage가 폴백으로 사용된다. localStorage는 XSS 취약점이 있을 경우 세션 토큰이 노출된다.
// 이상적으로는 서버가 HttpOnly 쿠키로 토큰을 set해야 한다. 단기 완화책: CSP 강화 + 짧은 토큰 수명.
function getBrowserStorage() {
  return getYeonOptionalLocalStorage();
}

export async function readPrimaryAuthSessionToken() {
  const secureStorage = getYeonSecureStorage();

  if (secureStorage) {
    return secureStorage.getItemAsync(PRIMARY_AUTH_SESSION_TOKEN_KEY);
  }

  const browserStorage = getBrowserStorage();

  if (browserStorage) {
    try {
      return browserStorage.getItem(PRIMARY_AUTH_SESSION_TOKEN_KEY);
    } catch {
      return inMemoryStorage.get(PRIMARY_AUTH_SESSION_TOKEN_KEY) ?? null;
    }
  }

  return inMemoryStorage.get(PRIMARY_AUTH_SESSION_TOKEN_KEY) ?? null;
}

export async function writePrimaryAuthSessionToken(sessionToken: string) {
  const secureStorage = getYeonSecureStorage();

  if (secureStorage) {
    try {
      await secureStorage.setItemAsync(
        PRIMARY_AUTH_SESSION_TOKEN_KEY,
        sessionToken
      );
    } catch (error) {
      // 안전 저장소 쓰기 실패: in-memory 폴백으로 유지하되 실패를 상위로 전파해
      // 호출부(로그인 흐름)가 사용자에게 안내하거나 로그인을 중단할 수 있게 한다.
      inMemoryStorage.set(PRIMARY_AUTH_SESSION_TOKEN_KEY, sessionToken);
      throw error;
    }
    return;
  }

  const browserStorage = getBrowserStorage();

  if (browserStorage) {
    try {
      browserStorage.setItem(PRIMARY_AUTH_SESSION_TOKEN_KEY, sessionToken);
      return;
    } catch {
      inMemoryStorage.set(PRIMARY_AUTH_SESSION_TOKEN_KEY, sessionToken);
      return;
    }
  }

  inMemoryStorage.set(PRIMARY_AUTH_SESSION_TOKEN_KEY, sessionToken);
}

export async function clearPrimaryAuthSessionToken() {
  const secureStorage = getYeonSecureStorage();

  if (secureStorage) {
    await secureStorage.deleteItemAsync(PRIMARY_AUTH_SESSION_TOKEN_KEY);
    return;
  }

  const browserStorage = getBrowserStorage();

  if (browserStorage) {
    try {
      browserStorage.removeItem(PRIMARY_AUTH_SESSION_TOKEN_KEY);
    } finally {
      inMemoryStorage.delete(PRIMARY_AUTH_SESSION_TOKEN_KEY);
    }
    return;
  }

  inMemoryStorage.delete(PRIMARY_AUTH_SESSION_TOKEN_KEY);
}
