"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

import {
  getTypingBgmServerSnapshot,
  getTypingBgmSnapshot,
  subscribeTypingBgm,
  toggleTypingBgm,
} from "./typing-bgm-audio";

export function TypingBgmButton({
  showCredit = true,
}: { showCredit?: boolean } = {}) {
  const { playing, blocked } = useSyncExternalStore(
    subscribeTypingBgm,
    getTypingBgmSnapshot,
    getTypingBgmServerSnapshot
  );

  const Icon = playing ? Volume2 : VolumeX;
  const label = playing ? "BGM 끄기" : "BGM 켜기";

  return (
    <div className={SHARED_FEATURE_CLASS.inlineItemsCenterGap2}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={playing}
        title={label}
        onClick={() => {
          void toggleTypingBgm();
        }}
        className={`inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 ${SHARED_FEATURE_CLASS.text12EmphasisMuted} transition-colors hover:border-[#111] hover:text-[#111]`}
      >
        <Icon size={14} />
        <span>{playing ? "BGM ON" : "BGM"}</span>
        {showCredit ? (
          <span className="hidden text-[11px] font-medium text-[#777] md:inline">
            찹츄찹찹츄
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
