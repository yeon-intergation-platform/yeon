const baseConfig = {
  name: "연챗 - 익명 친구 만들기",
  slug: "chat-service",
  scheme: "chat-service",
  orientation: "portrait",
  userInterfaceStyle: "light",
  splash: {
    backgroundColor: "#FFFFFF",
    image: "./assets/images/chat-service-splash-animal.png",
    resizeMode: "contain",
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  ios: {
    bundleIdentifier: "com.yeon.chat",
  },
  android: {
    package: "com.yeon.chat",
  },
};

const cardVariantConfig = {
  name: "YEON 카드",
  slug: "yeon-card-service",
  scheme: "yeon-card-service",
  ios: {
    bundleIdentifier: "com.yeon.cardservice",
  },
  android: {
    package: "com.yeon.cardservice",
  },
};

const isCardApp = process.env.EXPO_PUBLIC_MOBILE_VARIANT === "card";

module.exports = {
  ...baseConfig,
  ...(isCardApp ? cardVariantConfig : {}),
};
