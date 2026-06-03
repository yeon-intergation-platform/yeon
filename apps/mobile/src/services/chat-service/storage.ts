import {
  getYeonOptionalLocalStorage,
  getYeonSecureStorage,
} from "@yeon/ui/native";

const CHAT_SERVICE_SESSION_KEY = "chat-service-session-token";
const inMemoryStorage = new Map<string, string>();

function getBrowserStorage() {
  return getYeonOptionalLocalStorage();
}

export async function readChatServiceSessionToken() {
  const secureStorage = getYeonSecureStorage();

  if (secureStorage) {
    return secureStorage.getItemAsync(CHAT_SERVICE_SESSION_KEY);
  }

  const browserStorage = getBrowserStorage();

  if (browserStorage) {
    try {
      return browserStorage.getItem(CHAT_SERVICE_SESSION_KEY);
    } catch {
      return inMemoryStorage.get(CHAT_SERVICE_SESSION_KEY) ?? null;
    }
  }

  return inMemoryStorage.get(CHAT_SERVICE_SESSION_KEY) ?? null;
}

export async function writeChatServiceSessionToken(token: string) {
  const secureStorage = getYeonSecureStorage();

  if (secureStorage) {
    await secureStorage.setItemAsync(CHAT_SERVICE_SESSION_KEY, token);
    return;
  }

  const browserStorage = getBrowserStorage();

  if (browserStorage) {
    try {
      browserStorage.setItem(CHAT_SERVICE_SESSION_KEY, token);
      return;
    } catch {
      inMemoryStorage.set(CHAT_SERVICE_SESSION_KEY, token);
      return;
    }
  }

  inMemoryStorage.set(CHAT_SERVICE_SESSION_KEY, token);
}

export async function clearChatServiceSessionToken() {
  const secureStorage = getYeonSecureStorage();

  if (secureStorage) {
    await secureStorage.deleteItemAsync(CHAT_SERVICE_SESSION_KEY);
    return;
  }

  const browserStorage = getBrowserStorage();

  if (browserStorage) {
    try {
      browserStorage.removeItem(CHAT_SERVICE_SESSION_KEY);
    } finally {
      inMemoryStorage.delete(CHAT_SERVICE_SESSION_KEY);
    }
    return;
  }

  inMemoryStorage.delete(CHAT_SERVICE_SESSION_KEY);
}
