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
import {
  getGameServiceText,
  type GameServiceLanguage,
} from "./game-service-i18n";

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

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
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

type CommentSort = "latest" | "popular";

async function loadComments(
  gameSlug: string,
  sort: CommentSort,
  loadError: string
): Promise<GameComment[]> {
  const response = await fetchYeon(
    `/api/v1/game-service/comments?gameSlug=${encodeURIComponent(gameSlug)}&sort=${sort}`,
    { credentials: "include", cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error(loadError);
  }
  return gameCommentListResponseSchema.parse(await response.json()).items;
}

function GameCommentsInner({
  gameSlug,
  language,
}: {
  gameSlug: string;
  language: GameServiceLanguage;
}) {
  const text = getGameServiceText(language);
  const commentsText = text.comments;
  const [sort, setSort] = useState<CommentSort>("latest");
  const sessionQuery = useQuery({
    queryKey: ["auth-session"],
    queryFn: loadSession,
  });
  const commentsQuery = useQuery({
    queryKey: ["game-comments", gameSlug, sort, language],
    queryFn: () => loadComments(gameSlug, sort, commentsText.loadError),
  });

  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [guestNickname, setGuestNickname] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const resolveServerMessage = (
    serverMessage: string | undefined,
    fallback: string
  ) => (language === "ko" ? (serverMessage ?? fallback) : fallback);

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
      setFormError(commentsText.contentRequired);
      return;
    }
    if (!isAuthenticated) {
      if (guestNickname.trim().length < 1) {
        setFormError(commentsText.nicknameRequired);
        return;
      }
      if (guestPassword.length < 4) {
        setFormError(commentsText.passwordRequired);
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
        throw new Error(
          resolveServerMessage(data?.message, commentsText.submitFailed)
        );
      }
      setContent("");
      setIsSecret(false);
      setGuestPassword("");
      await commentsQuery.refetch();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : commentsText.submitFailed
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReveal = async (comment: GameComment) => {
    const password = window.prompt(commentsText.passwordPrompt);
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
        window.alert(
          resolveServerMessage(data?.message, commentsText.revealFailed)
        );
        return;
      }
      setRevealed((prev) => ({
        ...prev,
        [comment.id]: data.content as string,
      }));
    } catch {
      window.alert(commentsText.revealFailed);
    }
  };

  const handleDelete = async (comment: GameComment) => {
    let password: string | null = null;
    if (comment.isGuest && !comment.isMine) {
      password = window.prompt(commentsText.passwordPrompt);
      if (!password) return;
    } else if (!window.confirm(commentsText.deleteConfirm)) {
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
        window.alert(
          resolveServerMessage(data?.message, commentsText.deleteFailed)
        );
        return;
      }
      await commentsQuery.refetch();
    } catch {
      window.alert(commentsText.deleteFailed);
    }
  };

  const handleCommentLike = async (comment: GameComment) => {
    try {
      const response = await fetchYeon(
        `/api/v1/game-service/comments/${comment.id}/like`,
        { method: "POST", credentials: "include" }
      );
      if (response.status === 401) {
        window.alert(commentsText.likeLoginRequired);
        return;
      }
      if (!response.ok) throw new Error("실패");
      await commentsQuery.refetch();
    } catch {
      window.alert(commentsText.likeFailed);
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
        {commentsText.heading}{" "}
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-semibold text-[#999]"
        >
          {commentsText.count(count)}
        </YeonText>
      </YeonText>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
        {sessionReady && !isAuthenticated ? (
          <YeonView className="flex flex-wrap gap-2">
            <input
              type="text"
              value={guestNickname}
              onChange={(e) => setGuestNickname(e.target.value)}
              placeholder={commentsText.nicknamePlaceholder}
              maxLength={40}
              className="w-32 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#6b5bd2]"
            />
            <input
              type="password"
              value={guestPassword}
              onChange={(e) => setGuestPassword(e.target.value)}
              placeholder={commentsText.passwordPlaceholder}
              maxLength={72}
              className="w-32 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#6b5bd2]"
            />
          </YeonView>
        ) : null}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={commentsText.contentPlaceholder}
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
            {commentsText.secretLabel}
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#6b5bd2] px-5 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? commentsText.submitting : commentsText.submit}
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

      {count > 0 ? (
        <YeonView className="mt-5 flex gap-1.5">
          {(
            [
              { key: "latest", label: commentsText.latest },
              { key: "popular", label: commentsText.popular },
            ] as const
          ).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSort(option.key)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                sort === option.key
                  ? "bg-[#6b5bd2] text-white"
                  : "text-[#888] hover:text-[#6b5bd2]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </YeonView>
      ) : null}

      <YeonView className="mt-3 flex flex-col">
        {commentsQuery.isError ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="py-6 text-center text-[13px] text-[#999]"
          >
            {commentsText.loadError}
          </YeonText>
        ) : commentsQuery.isSuccess && count === 0 ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="py-6 text-center text-[13px] text-[#999]"
          >
            {commentsText.empty}
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
                        {commentsText.guest}
                      </YeonText>
                    ) : null}
                    <YeonText
                      as="span"
                      variant="unstyled"
                      tone="inherit"
                      className="text-[11px] text-[#bbb]"
                    >
                      {formatDate(comment.createdAt, text.dateLocale)}
                    </YeonText>
                  </YeonView>
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className="mt-1 whitespace-pre-line break-words text-[13px] leading-[1.6] text-[#444]"
                  >
                    {masked ? (
                      <span className="text-[#999]">
                        🔒 {commentsText.secretComment}
                      </span>
                    ) : (
                      shownContent
                    )}
                  </YeonText>
                  <YeonView className="mt-1.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCommentLike(comment)}
                      aria-pressed={comment.likedByMe}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                        comment.likedByMe
                          ? "text-[#e0376b]"
                          : "text-[#bbb] hover:text-[#e0376b]"
                      }`}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill={comment.likedByMe ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
                      </svg>
                      {comment.likeCount > 0
                        ? comment.likeCount
                        : commentsText.likeLabel}
                    </button>
                    {comment.canRevealWithPassword && masked ? (
                      <button
                        type="button"
                        onClick={() => handleReveal(comment)}
                        className="text-[11px] font-semibold text-[#6b5bd2] hover:underline"
                      >
                        {commentsText.revealWithPassword}
                      </button>
                    ) : null}
                    {comment.canDelete ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment)}
                        className="text-[11px] text-[#bbb] hover:text-[#d2685b]"
                      >
                        {commentsText.delete}
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
export function GameComments({
  gameSlug,
  language,
}: {
  gameSlug: string;
  language: GameServiceLanguage;
}) {
  return (
    <QueryProvider>
      <GameCommentsInner gameSlug={gameSlug} language={language} />
    </QueryProvider>
  );
}
