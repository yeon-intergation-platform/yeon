type ExpoProcessEnv = {
  NODE_ENV?: "development" | "production" | "test";
  EXPO_PUBLIC_API_BASE_URL?: string;
};

declare const process: {
  env: ExpoProcessEnv;
};
