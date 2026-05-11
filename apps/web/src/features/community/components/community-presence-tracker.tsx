"use client";

import { useEffect } from "react";

import {
  readPresenceSessionId,
  sendPresenceHeartbeat,
  sendPresenceLeave,
} from "../community-presence";

export function CommunityPresenceTracker() {
  useEffect(() => {
    const sessionId = readPresenceSessionId();

    void sendPresenceHeartbeat(sessionId);
    const intervalId = window.setInterval(() => {
      void sendPresenceHeartbeat(sessionId);
    }, 10_000);

    return () => {
      window.clearInterval(intervalId);
      sendPresenceLeave(sessionId);
    };
  }, []);

  return null;
}
