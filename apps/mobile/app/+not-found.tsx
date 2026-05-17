import { isCardApp } from "../src/lib/mobile-app-mode";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../src/theme/colors";

export default function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>페이지를 찾지 못했습니다.</Text>
      <Link
        href={isCardApp ? "/card-service" : "/(tabs)/feed"}
        style={styles.link}
      >
        {isCardApp ? "카드로 돌아가기" : "피드로 돌아가기"}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  link: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "800",
  },
});
