import {
  getYeonOptionalLocalStorage,
  getYeonSecureStorage,
} from "@yeon/ui/native";

const PRIMARY_AUTH_SESSION_TOKEN_KEY = "yeon.primary-auth.session-token";
const inMemoryStorage = new Map<string, string>();

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
    await secureStorage.setItemAsync(
      PRIMARY_AUTH_SESSION_TOKEN_KEY,
      sessionToken
    );
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
