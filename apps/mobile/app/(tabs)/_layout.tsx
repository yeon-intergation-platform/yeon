import {
  YeonIcon,
  YeonRedirect as Redirect,
  YeonTabs as Tabs,
  type YeonIconName,
} from "@yeon/ui/native";
import { useChatServiceSession } from "../../src/providers/chat-service-session-provider";
import { colors } from "../../src/theme/colors";

function renderTabIcon(name: YeonIconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <YeonIcon color={color} name={name} size={size} />
  );
}

export default function TabsLayout() {
  const { status } = useChatServiceSession();

  if (status === "booting") {
    return null;
  }

  if (status !== "signed_in") {
    return <Redirect href="/(auth)" />;
  }

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
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: renderTabIcon("message-circle"),
          tabBarLabel: "피드",
          title: "피드",
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          tabBarIcon: renderTabIcon("circle-help"),
          tabBarLabel: "에스크",
          title: "에스크",
        }}
      />

      <Tabs.Screen
        name="friends"
        options={{
          tabBarIcon: renderTabIcon("users"),
          tabBarLabel: "친구",
          title: "친구",
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: renderTabIcon("send"),
          tabBarLabel: "대화",
          title: "대화",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: renderTabIcon("circle-user"),
          tabBarLabel: "프로필",
          title: "프로필",
        }}
      />
    </Tabs>
  );
}
