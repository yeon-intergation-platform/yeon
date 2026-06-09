import { useEffect, useState } from "react";

import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
  resolveCardServiceSession,
} from "./card-service-session";

export function useCardServiceResolvedSession() {
  const [mode, setMode] = useState<CardServiceMode>(CARD_SERVICE_MODE.guest);
  const [isBooting, setBooting] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      setBooting(true);
      const resolved = await resolveCardServiceSession();
      if (!isMounted) {
        return;
      }
      setMode(resolved.mode);
      setSessionToken(resolved.sessionToken);
      setBooting(false);
    }

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isBooting, mode, sessionToken };
}
