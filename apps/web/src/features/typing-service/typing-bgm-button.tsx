"use client";
import { useSyncExternalStore } from "react";
import { YeonButton, YeonIcon, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
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

  const iconName = playing ? "volume-2" : "volume-x";
  const label = playing ? "BGM 끄기" : "BGM 켜기";

  return (
    <YeonView className={SHARED_FEATURE_CLASS.inlineItemsCenterGap2}>
      <YeonButton
        type="button"
        aria-label={label}
        aria-pressed={playing}
        title={label}
        onClick={() => {
          void toggleTypingBgm();
        }}
        variant="pill"
        size="sm"
        className={`gap-2 rounded-full px-3 py-1.5 ${SHARED_FEATURE_CLASS.text12EmphasisMuted}`}
      >
        <YeonIcon name={iconName} size={14} />
        <YeonText as="span" variant="unstyled" tone="inherit">
          {playing ? "BGM ON" : "BGM"}
        </YeonText>
        {showCredit ? (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="hidden text-[11px] font-medium text-[#666] md:inline"
          >
            배경음
          </YeonText>
        ) : null}
      </YeonButton>
      {blocked && (
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="hidden text-[11px] text-[#666] md:inline"
        >
          다시 눌러 재생해 주세요
        </YeonText>
      )}
    </YeonView>
  );
}
