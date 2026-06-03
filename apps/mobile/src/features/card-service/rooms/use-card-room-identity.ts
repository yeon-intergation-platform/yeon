import { useEffect, useState } from "react";
import {
  type CardRoomLocalProfile,
  readCardRoomGuestId,
  readCardRoomProfile,
} from "../../../services/card-rooms/profile-storage";

// 카드방 정체성(게스트 ID + 표시 프로필)을 저장소에서 로드.
export function useCardRoomIdentity() {
  const [profile, setProfile] = useState<CardRoomLocalProfile | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [nextProfile, nextGuestId] = await Promise.all([
        readCardRoomProfile(),
        readCardRoomGuestId(),
      ]);
      if (cancelled) return;
      setProfile(nextProfile);
      setGuestId(nextGuestId);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    profile,
    guestId,
    loaded: profile !== null && guestId !== null,
  };
}
