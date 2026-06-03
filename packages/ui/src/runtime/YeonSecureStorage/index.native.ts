import * as SecureStore from "expo-secure-store";

import { isYeonWebPlatform } from "../YeonBrowserRuntime/index.native";

export type YeonSecureStorage = {
  deleteItemAsync(key: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
};

export function canUseYeonSecureStorage() {
  return (
    !isYeonWebPlatform() &&
    typeof SecureStore.getItemAsync === "function" &&
    typeof SecureStore.setItemAsync === "function" &&
    typeof SecureStore.deleteItemAsync === "function"
  );
}

export function getYeonSecureStorage(): YeonSecureStorage | null {
  if (!canUseYeonSecureStorage()) {
    return null;
  }

  return SecureStore;
}
