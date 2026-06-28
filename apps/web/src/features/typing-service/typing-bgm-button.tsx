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
import { getTypingUiText } from "./typing-service-i18n";
import { useTypingSettings } from "./use-typing-settings";

export function TypingBgmButton({
  showCredit = true,
}: { showCredit?: boolean } = {}) {
  const { settings } = useTypingSettings();
  const text = getTypingUiText(settings.locale).bgm;
  const { playing, blocked } = useSyncExternalStore(
    subscribeTypingBgm,
    getTypingBgmSnapshot,
    getTypingBgmServerSnapshot
  );

  const iconName = playing ? "volume-2" : "volume-x";
  const label = playing ? text.turnOff : text.turnOn;

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
        data-active={playing}
        className={`gap-2 rounded-full px-3 py-1.5 ${SHARED_FEATURE_CLASS.text12EmphasisMuted} data-[active=true]:border-[#111] data-[active=true]:bg-[#111] data-[active=true]:text-white`}
      >
        <YeonIcon name={iconName} size={14} />
        <YeonText as="span" variant="unstyled" tone="inherit">
          {playing ? text.on : text.off}
        </YeonText>
        {showCredit ? (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="hidden text-[11px] font-medium text-[#666] md:inline"
          >
            {text.credit}
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
          {text.blocked}
        </YeonText>
      )}
    </YeonView>
  );
}
