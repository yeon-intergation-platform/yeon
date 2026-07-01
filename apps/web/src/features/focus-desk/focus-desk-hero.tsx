import { ListTodo, Timer } from "lucide-react";
import type { ReactElement } from "react";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { YeonText, YeonView } from "@yeon/ui";

export function FocusDeskHero({
  todoTitle,
}: {
  todoTitle: string | null;
}): ReactElement {
  return (
    <YeonView className="min-w-0">
      <YeonView className="flex min-w-0 max-w-full flex-wrap items-center gap-3">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-[12px] font-bold text-[#111]"
        >
          <Timer aria-hidden="true" size={14} />
          MoodDesk
        </YeonText>
        {todoTitle ? (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="flex w-full max-w-full min-w-0 items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-[12px] font-bold text-[#666] sm:w-auto sm:max-w-[28rem]"
          >
            <ListTodo aria-hidden="true" size={14} className="shrink-0" />
            <span className="block min-w-0 flex-1 truncate">{todoTitle}</span>
          </YeonText>
        ) : null}
      </YeonView>
      <YeonText
        as="h1"
        variant="unstyled"
        tone="inherit"
        className="mt-4 break-words text-[32px] font-black leading-tight tracking-[-0.04em] text-[#111] md:text-[44px]"
      >
        카드 덱을 집중 세션으로 실행합니다.
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={`mt-4 max-w-[760px] ${SHARED_FEATURE_CLASS.text13Neutral} leading-[1.8] md:text-[15px]`}
      >
        덱과 시간을 직접 고르면 MoodDesk가 카드 순서, 타이머, 채점 흐름을 한
        화면에 묶습니다. 덱 원본과 복습 기록은 card-service가 그대로 관리합니다.
      </YeonText>
    </YeonView>
  );
}
