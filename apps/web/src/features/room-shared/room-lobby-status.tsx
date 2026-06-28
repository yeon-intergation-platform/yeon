"use client";
import { YeonText, YeonView } from "@yeon/ui";

// 로비 로딩/빈/에러 상태의 시각 언어를 타자·카드에서 통일한다(#38,#39).

export function RoomLobbySpinner({ label }: { label: string }) {
  return (
    <YeonView className="flex min-h-[360px] flex-col items-center justify-center gap-3">
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#111]"
      />
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="text-[14px] font-medium text-[#888]"
      >
        {label}
      </YeonText>
    </YeonView>
  );
}

// 빈/에러 상태용 중립 아이콘(서비스 일러스트가 없을 때 일관된 자리 채움).
export function RoomLobbyStateIcon({
  variant,
}: {
  variant: "empty" | "error";
}) {
  return (
    <span
      aria-hidden="true"
      className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e5e5e5] bg-[#fafafa] text-[#bbb]"
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {variant === "error" ? (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </>
        ) : (
          <>
            <rect x="3" y="5" width="13" height="16" rx="2" />
            <path d="M8 3h11a2 2 0 0 1 2 2v13" />
          </>
        )}
      </svg>
    </span>
  );
}
