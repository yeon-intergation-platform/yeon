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
  plugins: [
    "expo-router",
    "expo-web-browser",
    [
      "expo-image-picker",
      {
        photosPermission:
          "카드에 첨부할 이미지를 선택하기 위해 사진 접근이 필요합니다.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  web: {
    bundler: "metro",
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
  splash: {
    backgroundColor: "#FFFFFF",
    image: "./assets/images/yeon-splash.png",
    resizeMode: "contain",
  },
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
