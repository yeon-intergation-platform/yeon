"use client";
import { useState } from "react";
import { useYeonQuery as useQuery } from "@yeon/ui/runtime/YeonQuery";
import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { gameLikeStatusSchema } from "@yeon/api-contract/game-like";
import { QueryProvider } from "@/lib/query-provider";
import {
  getGameServiceText,
  type GameServiceLanguage,
} from "./game-service-i18n";

async function loadStatus(gameSlug: string, loadError: string) {
  const response = await fetchYeon(
    `/api/v1/game-service/likes?gameSlug=${encodeURIComponent(gameSlug)}`,
    { credentials: "include", cache: "no-store" }
  );
  if (!response.ok) throw new Error(loadError);
  return gameLikeStatusSchema.parse(await response.json());
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function GameLikeButtonInner({
  gameSlug,
  language,
}: {
  gameSlug: string;
  language: GameServiceLanguage;
}) {
  const text = getGameServiceText(language).like;
  const likeQuery = useQuery({
    queryKey: ["game-like", gameSlug, language],
    queryFn: () => loadStatus(gameSlug, text.loadError),
  });
  const [pending, setPending] = useState(false);

  const count = likeQuery.data?.count ?? 0;
  const liked = likeQuery.data?.liked ?? false;

  const handleToggle = async () => {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetchYeon("/api/v1/game-service/likes", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gameSlug }),
      });
      if (response.status === 401) {
        window.alert(text.loginRequired);
        return;
      }
      if (!response.ok) throw new Error("실패");
      await likeQuery.refetch();
    } catch {
      window.alert(text.actionFailed);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? text.unlikeLabel : text.likeLabel}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors duration-200 disabled:opacity-60 ${
        liked
          ? "border-[#e0376b] bg-[#fdeaf1] text-[#e0376b]"
          : "border-[#e5e5e5] bg-white text-[#555] hover:border-[#e0376b] hover:text-[#e0376b]"
      }`}
    >
      <HeartIcon filled={liked} />
      {count.toLocaleString(language === "en" ? "en-US" : "ko-KR")}
    </button>
  );
}

export function GameLikeButton({
  gameSlug,
  language,
}: {
  gameSlug: string;
  language: GameServiceLanguage;
}) {
  return (
    <QueryProvider>
      <GameLikeButtonInner gameSlug={gameSlug} language={language} />
    </QueryProvider>
  );
}
