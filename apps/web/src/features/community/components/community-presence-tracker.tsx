"use client";
import { useEffect } from "react";
import {
  clearYeonInterval,
  scheduleYeonInterval,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  readPresenceSessionId,
  sendPresenceHeartbeat,
  sendPresenceLeave,
} from "../community-presence";

export function CommunityPresenceTracker() {
  useEffect(() => {
    const sessionId = readPresenceSessionId();

    const heartbeat = async () => {
      try {
        await sendPresenceHeartbeat(sessionId);
      } catch (error) {
        // 앱 부팅 직후/포트 미구동 구간에도 페이지 동작을 방해하지 않도록
        // presence heartbeats는 실패를 무시하되 원인은 숨기지 않습니다.
        console.warn("[CommunityPresence] heartbeat 실패", error);
      }
    };

    void heartbeat();
    const intervalId = scheduleYeonInterval(() => {
      void heartbeat();
    }, 10_000);

    return () => {
      clearYeonInterval(intervalId);
      sendPresenceLeave(sessionId);
    };
  }, []);

  return null;
}
