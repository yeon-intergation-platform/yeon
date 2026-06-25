"use client";
import { useState } from "react";
import { useYeonQuery as useQuery } from "@yeon/ui/runtime/YeonQuery";
import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { YeonText, YeonView } from "@yeon/ui";
import {
  gameCommentListResponseSchema,
  type GameComment,
} from "@yeon/api-contract/game-comment";
import { QueryProvider } from "@/lib/query-provider";

type SessionInfo = {
  authenticated: boolean;
  displayName: string | null;
  avatarUrl: string | null;
};

const AVATAR_COLORS = [
  "#6b5bd2",
  "#d2685b",
  "#5bd28a",
  "#d2b15b",
  "#5b9fd2",
  "#b15bd2",
];

function colorForName(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function Avatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white"
      style={{ backgroundColor: colorForName(name) }}
    >
      {initial}
    </span>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function loadSession(): Promise<SessionInfo> {
  const response = await fetchYeon("/api/v1/auth/session", {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    return { authenticated: false, displayName: null, avatarUrl: null };
  }
  const data = (await response.json()) as {
    authenticated?: boolean;
    user?: { displayName?: string | null; avatarUrl?: string | null };
  };
  return {
    authenticated: data.authenticated === true,
    displayName: data.user?.displayName ?? null,
    avatarUrl: data.user?.avatarUrl ?? null,
  };
}

async function loadComments(gameSlug: string): Promise<GameComment[]> {
  const response = await fetchYeon(
    `/api/v1/game-service/comments?gameSlug=${encodeURIComponent(gameSlug)}`,
    { credentials: "include", cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error("댓글을 불러오지 못했습니다.");
  }
  return gameCommentListResponseSchema.parse(await response.json()).items;
}

function GameCommentsInner({ gameSlug }: { gameSlug: string }) {
  const sessionQuery = useQuery({
    queryKey: ["auth-session"],
    queryFn: loadSession,
  });
  const commentsQuery = useQuery({
    queryKey: ["game-comments", gameSlug],
    queryFn: () => loadComments(gameSlug),
  });

  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [guestNickname, setGuestNickname] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const sessionReady = sessionQuery.isSuccess;
  const isAuthenticated = sessionQuery.data?.authenticated === true;
  const comments = commentsQuery.data;
  const count = comments?.length ?? 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);

    const trimmed = content.trim();
    if (!trimmed) {
      setFormError("댓글 내용을 입력해 주세요.");
      return;
    }
    if (!isAuthenticated) {
      if (guestNickname.trim().length < 1) {
        setFormError("닉네임을 입력해 주세요.");
        return;
      }
      if (guestPassword.length < 4) {
        setFormError("비밀번호는 4자 이상이어야 합니다.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetchYeon("/api/v1/game-service/comments", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          gameSlug,
          content: trimmed,
          isSecret,
          guestNickname: isAuthenticated ? undefined : guestNickname.trim(),
          guestPassword: isAuthenticated ? undefined : guestPassword,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(data?.message ?? "댓글을 등록하지 못했습니다.");
      }
      setContent("");
      setIsSecret(false);
      setGuestPassword("");
      await commentsQuery.refetch();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "댓글을 등록하지 못했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReveal = async (comment: GameComment) => {
    const password = window.prompt("비밀번호를 입력하세요");
    if (!password) return;
    try {
      const response = await fetchYeon(
        `/api/v1/game-service/comments/${comment.id}/reveal`,
        {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );
      const data = (await response.json().catch(() => null)) as {
        content?: string;
        message?: string;
      } | null;
      if (!response.ok || !data?.content) {
        window.alert(data?.message ?? "확인하지 못했습니다.");
        return;
      }
      setRevealed((prev) => ({
        ...prev,
        [comment.id]: data.content as string,
      }));
    } catch {
      window.alert("확인하지 못했습니다.");
    }
  };

  const handleDelete = async (comment: GameComment) => {
    let password: string | null = null;
    if (comment.isGuest && !comment.isMine) {
      password = window.prompt("비밀번호를 입력하세요");
      if (!password) return;
    } else if (!window.confirm("댓글을 삭제할까요?")) {
      return;
    }
    try {
      const query = password ? `?password=${encodeURIComponent(password)}` : "";
      const response = await fetchYeon(
        `/api/v1/game-service/comments/${comment.id}${query}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!response.ok && response.status !== 204) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        window.alert(data?.message ?? "삭제하지 못했습니다.");
        return;
      }
      await commentsQuery.refetch();
    } catch {
      window.alert("삭제하지 못했습니다.");
    }
  };

  return (
    <YeonView
      as="section"
      className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-5"
    >
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="text-[16px] font-bold text-[#111]"
      >
        댓글{" "}
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-semibold text-[#999]"
        >
          {count}개
        </YeonText>
      </YeonText>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
        {sessionReady && !isAuthenticated ? (
          <YeonView className="flex flex-wrap gap-2">
            <input
              type="text"
              value={guestNickname}
              onChange={(e) => setGuestNickname(e.target.value)}
              placeholder="닉네임"
              maxLength={40}
              className="w-32 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#6b5bd2]"
            />
            <input
              type="password"
              value={guestPassword}
              onChange={(e) => setGuestPassword(e.target.value)}
              placeholder="비밀번호"
              maxLength={72}
              className="w-32 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#6b5bd2]"
            />
          </YeonView>
        ) : null}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 남겨보세요"
          rows={3}
          maxLength={1000}
          className="w-full resize-y rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] leading-[1.6] outline-none focus:border-[#6b5bd2]"
        />
        <YeonView className="flex items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#666]">
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#6b5bd2]"
            />
            비밀댓글
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#6b5bd2] px-5 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </YeonView>
        {formError ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[12px] text-[#d2685b]"
          >
            {formError}
          </YeonText>
        ) : null}
      </form>

      <YeonView className="mt-5 flex flex-col">
        {commentsQuery.isError ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="py-6 text-center text-[13px] text-[#999]"
          >
            댓글을 불러오지 못했습니다.
          </YeonText>
        ) : commentsQuery.isSuccess && count === 0 ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="py-6 text-center text-[13px] text-[#999]"
          >
            첫 댓글을 남겨보세요!
          </YeonText>
        ) : (
          comments?.map((comment) => {
            const revealedContent = revealed[comment.id];
            const masked = comment.content === null && !revealedContent;
            const shownContent = revealedContent ?? comment.content;
            return (
              <YeonView
                key={comment.id}
                className="flex gap-3 border-b border-[#f0f0f0] py-3 last:border-b-0"
              >
                <Avatar
                  name={comment.displayName}
                  avatarUrl={comment.avatarUrl}
                />
                <YeonView className="min-w-0 flex-1">
                  <YeonView className="flex items-center gap-2">
                    <YeonText
                      as="span"
                      variant="unstyled"
                      tone="inherit"
                      className="text-[13px] font-bold text-[#111]"
                    >
                      {comment.displayName}
                    </YeonText>
                    {comment.isGuest ? (
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className="rounded bg-[#f2f2f2] px-1.5 py-0.5 text-[10px] text-[#999]"
                      >
                        게스트
                      </YeonText>
                    ) : null}
                    <YeonText
                      as="span"
                      variant="unstyled"
                      tone="inherit"
                      className="text-[11px] text-[#bbb]"
                    >
                      {formatDate(comment.createdAt)}
                    </YeonText>
                  </YeonView>
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className="mt-1 whitespace-pre-line break-words text-[13px] leading-[1.6] text-[#444]"
                  >
                    {masked ? (
                      <span className="text-[#999]">🔒 비밀 댓글입니다.</span>
                    ) : (
                      shownContent
                    )}
                  </YeonText>
                  <YeonView className="mt-1 flex gap-3">
                    {comment.canRevealWithPassword && masked ? (
                      <button
                        type="button"
                        onClick={() => handleReveal(comment)}
                        className="text-[11px] font-semibold text-[#6b5bd2] hover:underline"
                      >
                        비밀번호로 보기
                      </button>
                    ) : null}
                    {comment.canDelete ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment)}
                        className="text-[11px] text-[#bbb] hover:text-[#d2685b]"
                      >
                        삭제
                      </button>
                    ) : null}
                  </YeonView>
                </YeonView>
              </YeonView>
            );
          })
        )}
      </YeonView>
    </YeonView>
  );
}

// 공통 헤더처럼 전역 QueryProvider 밖에서도 동작하도록 자체 provider로 감싼다.
export function GameComments({ gameSlug }: { gameSlug: string }) {
  return (
    <QueryProvider>
      <GameCommentsInner gameSlug={gameSlug} />
    </QueryProvider>
  );
}
