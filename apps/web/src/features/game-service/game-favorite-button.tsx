"use client";
import { useState } from "react";
import { useYeonQuery as useQuery } from "@yeon/ui/runtime/YeonQuery";
import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { gameSlugListResponseSchema } from "@yeon/api-contract/game-library";
import { QueryProvider } from "@/lib/query-provider";

async function loadFavorites(): Promise<string[]> {
  const response = await fetchYeon("/api/v1/game-service/favorites", {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("찜 목록을 불러오지 못했습니다.");
  return gameSlugListResponseSchema.parse(await response.json()).slugs;
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function GameFavoriteButtonInner({ gameSlug }: { gameSlug: string }) {
  const favoritesQuery = useQuery({
    queryKey: ["game-favorites"],
    queryFn: loadFavorites,
  });
  const [pending, setPending] = useState(false);

  const isFavorite = favoritesQuery.data?.includes(gameSlug) ?? false;

  const handleToggle = async () => {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetchYeon("/api/v1/game-service/favorites", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gameSlug }),
      });
      if (response.status === 401) {
        window.alert("찜은 로그인 후 이용할 수 있어요.");
        return;
      }
      if (!response.ok) throw new Error("실패");
      await favoritesQuery.refetch();
    } catch {
      window.alert("찜을 처리하지 못했어요.");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "찜 취소" : "찜하기"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors duration-200 disabled:opacity-60 ${
        isFavorite
          ? "border-[#6b5bd2] bg-[#f1f0fb] text-[#6b5bd2]"
          : "border-[#e5e5e5] bg-white text-[#555] hover:border-[#6b5bd2] hover:text-[#6b5bd2]"
      }`}
    >
      <BookmarkIcon filled={isFavorite} />
      {isFavorite ? "찜함" : "찜"}
    </button>
  );
}

export function GameFavoriteButton({ gameSlug }: { gameSlug: string }) {
  return (
    <QueryProvider>
      <GameFavoriteButtonInner gameSlug={gameSlug} />
    </QueryProvider>
  );
}
