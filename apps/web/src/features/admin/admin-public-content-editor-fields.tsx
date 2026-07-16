"use client";

import type {
  CreatePublicContentArticleBody,
  PublicContentChannel,
  PublicContentRevisionDto,
} from "@yeon/api-contract/public-content";
import { YeonLegacyMarkdownEditor } from "@yeon/ui/rich-content/YeonMarkdownEditor";
import { PublicContentMarkdownView } from "@/features/public-content/public-content-markdown-view";

const CHANNEL_OPTIONS = ["support", "news", "blog"] as const;
const SERVICE_OPTIONS = [
  "nexa",
  "typing",
  "card",
  "community",
  "account",
  "yeon",
] as const;
const CATEGORY_OPTIONS = {
  support: [
    "getting-started",
    "guides",
    "tutorials",
    "troubleshooting",
    "faq",
    "policy",
  ],
  news: ["notice", "updates", "news"],
  blog: ["engineering", "product", "devlog", "essay"],
} as const;

const FIELD_CLASS =
  "mt-2 min-h-11 w-full rounded-lg border border-[#d6d6d6] bg-white px-3 py-2 text-[14px] text-[#111] outline-none transition-colors focus:border-[#111] focus:ring-2 focus:ring-[#111]/10";
const LABEL_CLASS = "block text-[13px] font-semibold text-[#333]";

export type EditorValues = CreatePublicContentArticleBody & {
  version?: number;
};
export type EditorMode = "edit" | "preview";
export type UpdateEditorValue = <K extends keyof EditorValues>(
  key: K,
  value: EditorValues[K]
) => void;

export function getInitialPublicContentCategory(channel: PublicContentChannel) {
  return CATEGORY_OPTIONS[channel][0];
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function AdminPublicContentPrimaryFields({
  channelLocked,
  update,
  values,
}: {
  channelLocked: boolean;
  update: UpdateEditorValue;
  values: EditorValues;
}) {
  const categories = CATEGORY_OPTIONS[values.channel];

  return (
    <section className="mt-6 grid gap-5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 md:grid-cols-2 md:p-6 xl:grid-cols-4">
      <label className={LABEL_CLASS}>
        채널
        <select
          className={FIELD_CLASS}
          disabled={channelLocked}
          value={values.channel}
          onChange={(event) => {
            const channel = event.target.value as PublicContentChannel;
            update("channel", channel);
            update("category", getInitialPublicContentCategory(channel));
          }}
        >
          {CHANNEL_OPTIONS.map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </select>
      </label>
      <label className={LABEL_CLASS}>
        서비스
        <select
          className={FIELD_CLASS}
          value={values.serviceKey}
          onChange={(event) =>
            update(
              "serviceKey",
              event.target.value as EditorValues["serviceKey"]
            )
          }
        >
          {SERVICE_OPTIONS.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </label>
      <label className={LABEL_CLASS}>
        분류
        <select
          className={FIELD_CLASS}
          value={values.category}
          onChange={(event) =>
            update("category", event.target.value as EditorValues["category"])
          }
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className={LABEL_CLASS}>
        공개 범위
        <select
          className={FIELD_CLASS}
          value={values.visibility}
          onChange={(event) =>
            update(
              "visibility",
              event.target.value as EditorValues["visibility"]
            )
          }
        >
          <option value="public">public</option>
          <option value="unlisted">unlisted</option>
          <option value="internal">internal</option>
        </select>
      </label>
      <label className={`${LABEL_CLASS} md:col-span-2`}>
        제목
        <input
          className={FIELD_CLASS}
          maxLength={160}
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
        />
      </label>
      <label className={`${LABEL_CLASS} md:col-span-2`}>
        slug
        <input
          className={FIELD_CLASS}
          disabled={channelLocked}
          maxLength={240}
          placeholder="engineering/example-title"
          value={values.slug}
          onChange={(event) => update("slug", event.target.value)}
        />
      </label>
      <label className={`${LABEL_CLASS} md:col-span-2`}>
        설명
        <textarea
          className={`${FIELD_CLASS} min-h-24`}
          maxLength={240}
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
        />
      </label>
      <label className={`${LABEL_CLASS} md:col-span-2`}>
        요약
        <textarea
          className={`${FIELD_CLASS} min-h-24`}
          maxLength={320}
          value={values.summary}
          onChange={(event) => update("summary", event.target.value)}
        />
      </label>
    </section>
  );
}

export function AdminPublicContentMarkdownFields({
  mode,
  setMode,
  update,
  values,
}: {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  update: UpdateEditorValue;
  values: EditorValues;
}) {
  return (
    <>
      <div
        className="mt-6 flex rounded-lg border border-[#d6d6d6] p-1 lg:hidden"
        aria-label="편집 화면 전환"
      >
        {(["edit", "preview"] as const).map((tab) => (
          <button
            key={tab}
            className={`min-h-11 flex-1 rounded-md text-[14px] font-semibold ${mode === tab ? "bg-[#111] text-white" : "text-[#666]"}`}
            onClick={() => setMode(tab)}
            type="button"
          >
            {tab === "edit" ? "본문 편집" : "미리보기"}
          </button>
        ))}
      </div>

      <section className="mt-4 grid gap-5 lg:grid-cols-2">
        <div className={mode === "preview" ? "hidden lg:block" : "block"}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Markdown 본문</h2>
            <span className="text-[12px] text-[#666]">
              H1은 제목 필드를 사용합니다
            </span>
          </div>
          <div
            data-color-mode="light"
            className="overflow-hidden rounded-lg border border-[#d6d6d6] bg-white"
          >
            <YeonLegacyMarkdownEditor
              height={640}
              preview="edit"
              value={values.bodyMarkdown}
              onChange={(value) => update("bodyMarkdown", value ?? "")}
            />
          </div>
        </div>
        <div className={mode === "edit" ? "hidden lg:block" : "block"}>
          <h2 className="mb-3 text-[18px] font-semibold">공개 화면 미리보기</h2>
          <div className="min-h-[640px] rounded-lg border border-[#d6d6d6] bg-white p-5 md:p-8">
            <p className="text-[12px] font-semibold text-[#666]">
              {values.channel} · {values.category}
            </p>
            <h1 className="mt-3 text-[28px] font-semibold leading-tight">
              {values.title || "제목을 입력해 주세요"}
            </h1>
            <p className="mt-3 text-[14px] leading-6 text-[#666]">
              {values.description || "글 설명이 여기에 표시됩니다."}
            </p>
            <div className="mt-8 border-t border-[#e5e5e5] pt-7">
              <PublicContentMarkdownView markdown={values.bodyMarkdown} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function AdminPublicContentSeoFields({
  canDelete,
  deleteDraft,
  pending,
  update,
  values,
}: {
  canDelete: boolean;
  deleteDraft: () => void;
  pending: boolean;
  update: UpdateEditorValue;
  values: EditorValues;
}) {
  return (
    <section className="mt-6 grid gap-5 rounded-lg border border-[#e5e5e5] bg-white p-4 md:grid-cols-2 md:p-6">
      <h2 className="text-[18px] font-semibold md:col-span-2">SEO와 출처</h2>
      <label className={LABEL_CLASS}>
        SEO 제목
        <input
          className={FIELD_CLASS}
          maxLength={180}
          value={values.metaTitle ?? ""}
          onChange={(event) =>
            update("metaTitle", nullable(event.target.value))
          }
        />
      </label>
      <label className={LABEL_CLASS}>
        SEO 설명
        <input
          className={FIELD_CLASS}
          maxLength={260}
          value={values.metaDescription ?? ""}
          onChange={(event) =>
            update("metaDescription", nullable(event.target.value))
          }
        />
      </label>
      <label className={LABEL_CLASS}>
        OG 이미지 URL
        <input
          className={FIELD_CLASS}
          maxLength={2048}
          value={values.ogImageUrl ?? ""}
          onChange={(event) =>
            update("ogImageUrl", nullable(event.target.value))
          }
        />
      </label>
      <label className={LABEL_CLASS}>
        redirect URL
        <input
          className={FIELD_CLASS}
          maxLength={2048}
          value={values.redirectTo ?? ""}
          onChange={(event) =>
            update("redirectTo", nullable(event.target.value))
          }
        />
      </label>
      <label className={LABEL_CLASS}>
        CTA 문구
        <input
          className={FIELD_CLASS}
          maxLength={80}
          value={values.ctaLabel ?? ""}
          onChange={(event) => update("ctaLabel", nullable(event.target.value))}
        />
      </label>
      <label className={LABEL_CLASS}>
        CTA 주소
        <input
          className={FIELD_CLASS}
          maxLength={2048}
          value={values.ctaHref ?? ""}
          onChange={(event) => update("ctaHref", nullable(event.target.value))}
        />
      </label>
      <label className={LABEL_CLASS}>
        작성자 key
        <input
          className={FIELD_CLASS}
          maxLength={80}
          value={values.authorKey}
          onChange={(event) => update("authorKey", event.target.value)}
        />
      </label>
      <label className={LABEL_CLASS}>
        출처 저장소
        <input
          className={FIELD_CLASS}
          maxLength={160}
          value={values.sourceRepo ?? ""}
          onChange={(event) =>
            update("sourceRepo", nullable(event.target.value))
          }
        />
      </label>
      <label className={`${LABEL_CLASS} md:col-span-2`}>
        출처 경로 (줄마다 하나)
        <textarea
          className={`${FIELD_CLASS} min-h-28`}
          value={values.sourcePaths.join("\n")}
          onChange={(event) =>
            update(
              "sourcePaths",
              event.target.value
                .split("\n")
                .map((path) => path.trim())
                .filter(Boolean)
            )
          }
        />
      </label>
      <label className="flex min-h-11 items-center gap-3 text-[14px] font-semibold text-[#333]">
        <input
          checked={values.noindex}
          onChange={(event) => update("noindex", event.target.checked)}
          type="checkbox"
        />
        검색엔진 색인 제외 (noindex)
      </label>
      {canDelete ? (
        <div className="md:col-span-2">
          <button
            className="min-h-11 rounded-lg border border-[#e5484d] px-4 text-[14px] font-semibold text-[#b42318] hover:bg-[#fff5f5]"
            disabled={pending}
            onClick={deleteDraft}
            type="button"
          >
            초안 영구 삭제
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function AdminPublicContentRevisionHistory({
  revisions,
}: {
  revisions: readonly PublicContentRevisionDto[];
}) {
  return (
    <section className="mt-6 rounded-lg border border-[#e5e5e5] bg-white p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[18px] font-semibold">발행 리비전</h2>
          <p className="mt-2 text-[13px] leading-5 text-[#666]">
            발행 시점의 제목과 Markdown 본문은 변경되지 않는 기록으로
            보관됩니다.
          </p>
        </div>
        <span className="text-[13px] font-semibold text-[#666]">
          {revisions.length}개
        </span>
      </div>
      {revisions.length === 0 ? (
        <p className="mt-5 rounded-lg bg-[#fafafa] px-4 py-4 text-[13px] text-[#666]">
          아직 발행된 리비전이 없습니다.
        </p>
      ) : (
        <ol className="mt-5 divide-y divide-[#e5e5e5] border-y border-[#e5e5e5]">
          {revisions.map((revision) => (
            <li
              key={revision.id}
              className="grid gap-1 py-4 md:grid-cols-[100px_minmax(0,1fr)_180px] md:items-center"
            >
              <span className="text-[13px] font-semibold text-[#555]">
                revision {revision.revisionNumber}
              </span>
              <span className="text-[14px] font-semibold text-[#111]">
                {revision.title}
              </span>
              <time
                className="text-[12px] text-[#666] md:text-right"
                dateTime={revision.publishedAt}
              >
                {new Intl.DateTimeFormat("ko-KR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Seoul",
                }).format(new Date(revision.publishedAt))}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
