export type YeonSecureStorage = {
  deleteItemAsync(key: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
};

export function canUseYeonSecureStorage() {
  return false;
}

export function getYeonSecureStorage(): YeonSecureStorage | null {
  return null;
}
