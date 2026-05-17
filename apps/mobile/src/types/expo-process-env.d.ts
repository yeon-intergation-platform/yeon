declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: "development" | "production" | "test";
    EXPO_PUBLIC_API_BASE_URL?: string;
    EXPO_PUBLIC_MOBILE_VARIANT?: "anonymous" | "card" | (string & {});
    EXPO_PUBLIC_SKIP_ANONYMOUS_CHAT_PHONE_AUTH?: string;
  }
}
