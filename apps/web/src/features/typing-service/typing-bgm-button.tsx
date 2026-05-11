"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { PUBLIC_MP3_ASSET_URLS } from "@/lib/public-mp3-assets";

const TYPING_ROOM_BGM_SRC = PUBLIC_MP3_ASSET_URLS.typingRoomBgm;

let typingRoomBgmAudio: HTMLAudioElement | null = null;

function getTypingRoomBgmAudio() {
  if (typeof window === "undefined") return null;

  typingRoomBgmAudio ??= new Audio(TYPING_ROOM_BGM_SRC);
  typingRoomBgmAudio.loop = true;
  typingRoomBgmAudio.volume = 0.22;
  typingRoomBgmAudio.preload = "auto";
  return typingRoomBgmAudio;
}

export function TypingBgmButton({
  showCredit = true,
}: { showCredit?: boolean } = {}) {
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const audio = getTypingRoomBgmAudio();
    if (!audio) return;

    const syncPlayingState = () => {
      setPlaying(!audio.paused);
      setBlocked(false);
    };

    syncPlayingState();
    audio.addEventListener("play", syncPlayingState);
    audio.addEventListener("pause", syncPlayingState);
    audio.addEventListener("ended", syncPlayingState);

    return () => {
      audio.removeEventListener("play", syncPlayingState);
      audio.removeEventListener("pause", syncPlayingState);
      audio.removeEventListener("ended", syncPlayingState);
    };
  }, []);

  const toggleBgm = async () => {
    const audio = getTypingRoomBgmAudio();
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      setBlocked(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
      setBlocked(false);
    } catch {
      setBlocked(true);
      setPlaying(false);
    }
  };

  const Icon = playing ? Volume2 : VolumeX;
  const label = playing ? "BGM 끄기" : "BGM 켜기";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={label}
        aria-pressed={playing}
        title={label}
        onClick={toggleBgm}
        className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#555] transition-colors hover:border-[#111] hover:text-[#111]"
      >
        <Icon size={14} />
        <span>{playing ? "BGM ON" : "BGM"}</span>
        {showCredit ? (
          <span className="hidden text-[11px] font-medium text-[#777] md:inline">
            Kevin MacLeod
          </span>
        ) : null}
      </button>
      {blocked && (
        <span className="hidden text-[11px] text-[#c2410c] md:inline">
          다시 눌러 재생해 주세요
        </span>
      )}
    </div>
  );
}
