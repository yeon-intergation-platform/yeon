import {
  YeonTabs as Tabs,
  yeonMobileAppColors as colors,
} from "@yeon/ui/native";
import {
  CardTabIcon,
  type CardTabIconName,
} from "../../../src/features/card-service/card-tab-icon";
import { CARD_SERVICE_TEXT } from "../../../src/features/card-service/card-service-copy";

function renderTabIcon(name: CardTabIconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <CardTabIcon color={color} name={name} size={size} />
  );
}

// 카드 앱 하단 탭: 카드방 · 홈 · 설정.
export default function CardTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surfaceStrong,
          borderTopColor: colors.border,
          height: 74,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      {/* 탭 순서: 카드방 · 홈 · 설정 */}
      <Tabs.Screen
        name="rooms"
        options={{
          tabBarIcon: renderTabIcon("rooms"),
          tabBarLabel: CARD_SERVICE_TEXT.rooms.tabTitle,
          title: CARD_SERVICE_TEXT.rooms.tabTitle,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: renderTabIcon("home"),
          tabBarLabel: "홈",
          title: "홈",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: renderTabIcon("settings"),
          tabBarLabel: CARD_SERVICE_TEXT.settings.title,
          title: CARD_SERVICE_TEXT.settings.title,
        }}
      />
    </Tabs>
  );
}
