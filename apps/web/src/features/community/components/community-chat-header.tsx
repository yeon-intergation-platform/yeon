"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

type CommunityChatHeaderProps = {
  activePresenceCount: number;
  compact?: boolean;
  feed?: boolean;
};

export function CommunityChatHeader({
  activePresenceCount,
  compact = false,
  feed = false,
}: CommunityChatHeaderProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 pr-10">
        <h2 className="text-[15px] font-semibold text-[#111]">실시간 채팅</h2>
        <span
          className={`inline-flex items-center gap-1.5 ${SHARED_FEATURE_CLASS.text12EmphasisSubtle}`}
          aria-label={`현재 접속 ${activePresenceCount}명`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>{activePresenceCount}</span>
        </span>
      </div>
    );
  }

  return (
    <div className={feed ? "px-5 py-3 sm:px-6" : "px-4 py-3"}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="whitespace-nowrap text-[16px] font-black tracking-[-0.02em] text-[#0f1419]">
            실시간 채팅
          </h2>
        </div>
        <div
          className="flex items-center gap-2 text-[18px] font-black text-[#6f6f6f]"
          aria-label={`현재 접속 ${activePresenceCount}명`}
        >
          <span
            className="h-4 w-4 rounded-full bg-[#59b47c]"
            aria-hidden="true"
          />
          <span>{activePresenceCount}</span>
        </div>
      </div>
    </div>
  );
}
