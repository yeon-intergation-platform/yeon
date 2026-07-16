"use client";

import type {
  CreatePublicContentArticleBody,
  PublicContentAdminArticleDto,
  PublicContentChannel,
  PublicContentRevisionDto,
  PublicContentStatus,
  UpdatePublicContentArticleBody,
} from "@yeon/api-contract/public-content";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminPageShell } from "./admin-shell";
import {
  AdminPublicContentMarkdownFields,
  AdminPublicContentPrimaryFields,
  AdminPublicContentRevisionHistory,
  AdminPublicContentSeoFields,
  getInitialPublicContentCategory,
  type EditorMode,
  type EditorValues,
} from "./admin-public-content-editor-fields";
import {
  canDeletePublicContentDraft,
  hasPublicContentPublishedHistory,
} from "./admin-public-content-editor-state";
const STATUS_LABELS = {
  draft: "초안",
  review: "검수 중",
  published: "발행됨",
  archived: "보관됨",
} as const satisfies Record<PublicContentStatus, string>;
const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-[#111] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50";
const GHOST_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d6d6d6] bg-white px-4 text-[14px] font-semibold text-[#333] transition-colors hover:border-[#111] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-50";

type TransitionAction = "review" | "publish" | "archive" | "restore";

function defaultValues(channel: PublicContentChannel): EditorValues {
  return {
    channel,
    serviceKey: channel === "support" ? "nexa" : "yeon",
    category: getInitialPublicContentCategory(channel),
    slug: "",
    title: "",
    description: "",
    summary: "",
    bodyFormat: "markdown",
    bodyMarkdown: "## 시작하기\n\n본문을 작성해 주세요.",
    ctaLabel: null,
    ctaHref: null,
    visibility: "public",
    noindex: false,
    metaTitle: null,
    metaDescription: null,
    ogImageUrl: null,
    authorKey: "yeon",
    sourceRepo: "yeon",
    sourcePaths: [],
    redirectTo: null,
  };
}

function valuesFromArticle(
  article: PublicContentAdminArticleDto
): EditorValues {
  return {
    channel: article.channel,
    serviceKey: article.serviceKey,
    category: article.category,
    slug: article.slug,
    title: article.title,
    description: article.description,
    summary: article.summary,
    bodyFormat: "markdown",
    bodyMarkdown: article.bodyMarkdown,
    ctaLabel: article.ctaLabel,
    ctaHref: article.ctaHref,
    visibility: article.visibility,
    noindex: article.noindex,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    ogImageUrl: article.ogImageUrl,
    authorKey: article.authorKey,
    sourceRepo: article.sourceRepo,
    sourcePaths: article.sourcePaths,
    redirectTo: article.redirectTo,
    version: article.version,
  };
}

function nextAction(
  status: PublicContentStatus | null
): TransitionAction | null {
  if (status === "draft") return "review";
  if (status === "review") return "publish";
  if (status === "archived") return "restore";
  return null;
}

function actionLabel(action: TransitionAction) {
  return {
    review: "검수 요청",
    publish: "발행",
    archive: "보관",
    restore: "초안으로 복구",
  }[action];
}

async function errorMessage(response: Response) {
  const fallback = "요청을 처리하지 못했습니다.";
  try {
    const body = (await response.json()) as {
      message?: string;
      error?: { message?: string };
    };
    return body.message ?? body.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export function AdminPublicContentEditor({
  adminEmail,
  defaultChannel,
  initialArticle,
  initialRevisions,
}: {
  adminEmail: string;
  defaultChannel: PublicContentChannel;
  initialArticle: PublicContentAdminArticleDto | null;
  initialRevisions: readonly PublicContentRevisionDto[];
}) {
  const router = useRouter();
  const [article, setArticle] = useState(initialArticle);
  const [values, setValues] = useState<EditorValues>(() =>
    initialArticle
      ? valuesFromArticle(initialArticle)
      : defaultValues(defaultChannel)
  );
  const [savedSignature, setSavedSignature] = useState(() =>
    JSON.stringify(values)
  );
  const [mode, setMode] = useState<EditorMode>("edit");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revisions, setRevisions] = useState(initialRevisions);
  const dirty = JSON.stringify(values) !== savedSignature;
  const action = nextAction(article?.status ?? null);
  const hasPublishedHistory = hasPublicContentPublishedHistory(
    article,
    revisions
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  function update<K extends keyof EditorValues>(
    key: K,
    value: EditorValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setMessage(null);
    setError(null);
  }

  function applyArticle(savedArticle: PublicContentAdminArticleDto) {
    const nextValues = valuesFromArticle(savedArticle);
    setArticle(savedArticle);
    setValues(nextValues);
    setSavedSignature(JSON.stringify(nextValues));
  }

  async function refreshRevisionHistory(articleId: string) {
    try {
      const response = await fetch(
        `/api/v1/admin/content/${articleId}/revisions`
      );
      if (!response.ok) return;
      const body = (await response.json()) as {
        revisions: PublicContentRevisionDto[];
      };
      setRevisions(body.revisions);
    } catch {
      // 발행은 이미 완료되었으므로 리비전 목록 갱신 실패를 상태 변경 실패로 바꾸지 않는다.
    }
  }

  async function save() {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const endpoint = article
        ? `/api/v1/admin/content/${article.id}`
        : "/api/v1/admin/content";
      const body:
        | CreatePublicContentArticleBody
        | UpdatePublicContentArticleBody = article
        ? { ...values, version: article.version }
        : values;
      const response = await fetch(endpoint, {
        method: article ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const saved = (await response.json()) as {
        article: PublicContentAdminArticleDto;
      };
      applyArticle(saved.article);
      setMessage(article ? "저장했습니다." : "초안을 만들었습니다.");
      if (!article) {
        router.replace(`/admin/content/${saved.article.id}/edit`);
      }
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "저장하지 못했습니다."
      );
    } finally {
      setPending(false);
    }
  }

  async function transition(actionToRun: TransitionAction) {
    if (!article) return;
    if (
      actionToRun === "archive" &&
      !window.confirm(
        "이 글을 보관하면 공개 페이지에서 즉시 내려갑니다. 계속할까요?"
      )
    ) {
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/v1/admin/content/${article.id}/${actionToRun}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ version: article.version }),
        }
      );
      if (!response.ok) throw new Error(await errorMessage(response));
      const saved = (await response.json()) as {
        article: PublicContentAdminArticleDto;
      };
      applyArticle(saved.article);
      if (actionToRun === "publish") {
        await refreshRevisionHistory(article.id);
      }
      setMessage(`${actionLabel(actionToRun)} 처리가 완료되었습니다.`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "상태를 변경하지 못했습니다."
      );
    } finally {
      setPending(false);
    }
  }

  async function deleteDraft() {
    if (
      !article ||
      !window.confirm("발행 이력이 없는 이 초안을 영구 삭제할까요?")
    ) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/admin/content/${article.id}?version=${article.version}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error(await errorMessage(response));
      router.push("/admin/content");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "초안을 삭제하지 못했습니다."
      );
      setPending(false);
    }
  }

  const status = article?.status ?? "draft";
  const canDelete = canDeletePublicContentDraft(article, revisions);

  return (
    <AdminPageShell
      adminEmail={adminEmail}
      currentHref="/admin/content"
      sectionLabel="공개 콘텐츠 편집"
    >
      <main className="mx-auto max-w-[1400px] px-4 py-6 text-[#111] sm:px-6 md:px-12 md:py-10">
        <header className="flex flex-col gap-4 border-b border-[#e5e5e5] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <a
              className="text-[13px] font-semibold text-[#666] hover:text-[#111]"
              href="/admin/content"
            >
              ← 콘텐츠 목록
            </a>
            <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#666]">
              Markdown CMS
            </p>
            <h1 className="mt-2 text-[28px] font-semibold">
              {article ? "공개 콘텐츠 편집" : "새 공개 콘텐츠"}
            </h1>
            <p className="mt-2 text-[13px] text-[#666]">
              {STATUS_LABELS[status]} · version {article?.version ?? 1}
              {dirty ? " · 저장하지 않은 변경 있음" : " · 저장됨"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {article ? (
              <a
                className={GHOST_BUTTON_CLASS}
                href={`/api/v1/admin/content/${article.id}/export`}
              >
                Markdown 내보내기
              </a>
            ) : null}
            {article?.status === "published" ? (
              <button
                className={GHOST_BUTTON_CLASS}
                disabled={pending || dirty}
                onClick={() => transition("archive")}
                type="button"
              >
                보관
              </button>
            ) : null}
            {action ? (
              <button
                className={GHOST_BUTTON_CLASS}
                disabled={pending || dirty}
                onClick={() => transition(action)}
                type="button"
              >
                {actionLabel(action)}
              </button>
            ) : null}
            <button
              className={PRIMARY_BUTTON_CLASS}
              disabled={pending || !dirty}
              onClick={save}
              type="button"
            >
              {pending ? "처리 중…" : article ? "변경 저장" : "초안 만들기"}
            </button>
          </div>
        </header>

        {message ? (
          <p className="mt-4 rounded-lg border border-[#3f8f5f] bg-[#f3fbf6] px-4 py-3 text-[13px] font-semibold text-[#277047]">
            {message}
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-[#e5484d] bg-[#fff5f5] px-4 py-3 text-[13px] font-semibold text-[#b42318]"
          >
            {error}
          </p>
        ) : null}

        <AdminPublicContentPrimaryFields
          channelLocked={hasPublishedHistory}
          update={update}
          values={values}
        />
        <AdminPublicContentMarkdownFields
          mode={mode}
          setMode={setMode}
          update={update}
          values={values}
        />
        <AdminPublicContentSeoFields
          canDelete={canDelete}
          deleteDraft={deleteDraft}
          pending={pending}
          update={update}
          values={values}
        />
        {article ? (
          <AdminPublicContentRevisionHistory revisions={revisions} />
        ) : null}
      </main>
    </AdminPageShell>
  );
}
