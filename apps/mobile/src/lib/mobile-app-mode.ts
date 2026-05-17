export const MOBILE_APP_VARIANT =
  process.env.EXPO_PUBLIC_MOBILE_VARIANT === "card" ? "card" : "anonymous";

export const isCardApp = MOBILE_APP_VARIANT === "card";

export const isAnonymousApp = MOBILE_APP_VARIANT === "anonymous";
