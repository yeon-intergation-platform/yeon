import {
  PUBLIC_CONTENT_API_PATHS,
  createPublicContentArticleBodySchema,
  publicContentAdminArticleListResponseSchema,
  publicContentAdminArticleResponseSchema,
  publicContentAdminListQuerySchema,
  publicContentArticleListResponseSchema,
  publicContentArticleResponseSchema,
  publicContentChannelSchema,
  publicContentListQuerySchema,
  publicContentRedirectResponseSchema,
  publicContentSlugSchema,
  publicContentRevisionListResponseSchema,
  publicContentSnapshotResponseSchema,
  publicContentSitemapResponseSchema,
  transitionPublicContentArticleBodySchema,
  updatePublicContentArticleBodySchema,
  type CreatePublicContentArticleBody,
  type PublicContentAdminArticleListResponse,
  type PublicContentAdminArticleResponse,
  type PublicContentAdminListQuery,
  type PublicContentArticleListResponse,
  type PublicContentArticleResponse,
  type PublicContentChannel,
  type PublicContentListQuery,
  type PublicContentRedirectResponse,
  type PublicContentRevisionListResponse,
  type PublicContentSitemapResponse,
  type PublicContentSnapshotResponse,
  type TransitionPublicContentArticleBody,
  type UpdatePublicContentArticleBody,
} from "@yeon/api-contract/public-content";
import {
  createYeonHeaders,
  fetchYeon,
  type YeonRequestInit,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const ADMIN_ARTICLE_ID_MAX_LENGTH = 80;
const PUBLIC_CONTENT_BACKEND_TIMEOUT_MS = 5_000;

type ParseableSchema<TSchema> = {
  parse(input: unknown): TSchema;
};

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

function toQueryString(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

function parseAdminUserId(userId: string) {
  const parsedUserId = userId.trim();

  if (!parsedUserId) {
    throw new PublicContentSpringBackendHttpError(401, "로그인이 필요합니다.");
  }

  return parsedUserId;
}

function parseAdminArticleId(articleId: string) {
  const parsedArticleId = articleId.trim();

  if (
    !parsedArticleId ||
    parsedArticleId.length > ADMIN_ARTICLE_ID_MAX_LENGTH
  ) {
    throw new PublicContentSpringBackendHttpError(
      400,
      "관리 대상 공개 콘텐츠 articleId가 올바르지 않습니다."
    );
  }

  return parsedArticleId;
}

function encodePathSegments(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function tryParseJson(raw: string) {
  try {
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function extractMessage(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  if ("message" in parsed && typeof parsed.message === "string") {
    return parsed.message;
  }

  if (
    "error" in parsed &&
    parsed.error &&
    typeof parsed.error === "object" &&
    "message" in parsed.error &&
    typeof parsed.error.message === "string"
  ) {
    return parsed.error.message;
  }

  return null;
}

export class PublicContentSpringBackendHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "PublicContentSpringBackendHttpError";
  }
}

export const PUBLIC_CONTENT_SNAPSHOT_CACHE_TAG = "public-content-snapshot";

export type PublicContentDownload = {
  bytes: ArrayBuffer;
  contentDisposition: string | null;
  contentType: string;
};

async function fetchPublicContentSpring<TResponse>(
  path: string,
  schema: ParseableSchema<TResponse>,
  fallbackMessage: string,
  init: YeonRequestInit = { method: "GET" }
): Promise<TResponse> {
  const headers = createYeonHeaders(init.headers);
  headers.set("accept", "application/json");

  let response: YeonResponse;
  try {
    response = await fetchYeon(`${resolveSpringBackendBaseUrl()}${path}`, {
      ...init,
      cache: init.cache ?? "no-store",
      headers,
      signal:
        init.signal ?? AbortSignal.timeout(PUBLIC_CONTENT_BACKEND_TIMEOUT_MS),
    });
  } catch {
    throw new PublicContentSpringBackendHttpError(
      503,
      "Spring backend와 연결할 수 없습니다."
    );
  }

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new PublicContentSpringBackendHttpError(
      response.status,
      extractMessage(parsed) ?? fallbackMessage
    );
  }

  return schema.parse(parsed);
}

export function fetchPublicContentArticlesFromSpring(
  query: PublicContentListQuery = {}
): Promise<PublicContentArticleListResponse> {
  const parsedQuery = publicContentListQuerySchema.parse(query);

  return fetchPublicContentSpring(
    `${PUBLIC_CONTENT_API_PATHS.publicList}${toQueryString(parsedQuery)}`,
    publicContentArticleListResponseSchema,
    "공개 콘텐츠 목록을 불러오지 못했습니다."
  );
}

export function fetchPublicContentSnapshotFromSpring(
  query: PublicContentListQuery = {}
): Promise<PublicContentSnapshotResponse> {
  const parsedQuery = publicContentListQuerySchema.parse(query);
  return fetchPublicContentSpring(
    `${PUBLIC_CONTENT_API_PATHS.publicSnapshot}${toQueryString(parsedQuery)}`,
    publicContentSnapshotResponseSchema,
    "공개 콘텐츠 발행본을 불러오지 못했습니다.",
    {
      method: "GET",
      cache: "force-cache",
      next: {
        revalidate: 60,
        tags: [PUBLIC_CONTENT_SNAPSHOT_CACHE_TAG],
      },
    }
  );
}

export function fetchPublicContentArticleFromSpring(params: {
  channel: PublicContentChannel;
  slug: string;
}): Promise<PublicContentArticleResponse> {
  const channel = publicContentChannelSchema.parse(params.channel);
  const slug = publicContentSlugSchema.parse(params.slug);

  return fetchPublicContentSpring(
    PUBLIC_CONTENT_API_PATHS.publicArticle(channel, encodePathSegments(slug)),
    publicContentArticleResponseSchema,
    "공개 콘텐츠 글을 불러오지 못했습니다."
  );
}

export function fetchPublicContentRedirectFromSpring(params: {
  channel: PublicContentChannel;
  slug: string;
}): Promise<PublicContentRedirectResponse> {
  const channel = publicContentChannelSchema.parse(params.channel);
  const slug = publicContentSlugSchema.parse(params.slug);

  return fetchPublicContentSpring(
    `${PUBLIC_CONTENT_API_PATHS.publicRedirect(channel)}${toQueryString({ slug })}`,
    publicContentRedirectResponseSchema,
    "보관된 공개 콘텐츠 redirect를 불러오지 못했습니다."
  );
}

export function fetchPublicContentSitemapFromSpring(
  channel: PublicContentChannel
): Promise<PublicContentSitemapResponse> {
  const parsedChannel = publicContentChannelSchema.parse(channel);

  return fetchPublicContentSpring(
    PUBLIC_CONTENT_API_PATHS.publicSitemap(parsedChannel),
    publicContentSitemapResponseSchema,
    "공개 콘텐츠 sitemap을 불러오지 못했습니다."
  );
}

export function fetchAdminPublicContentArticlesFromSpring(params: {
  userId: string;
  query?: PublicContentAdminListQuery;
}): Promise<PublicContentAdminArticleListResponse> {
  const userId = parseAdminUserId(params.userId);
  const parsedQuery = publicContentAdminListQuerySchema.parse(
    params.query ?? {}
  );

  return fetchPublicContentSpring(
    `${PUBLIC_CONTENT_API_PATHS.adminList}${toQueryString(parsedQuery)}`,
    publicContentAdminArticleListResponseSchema,
    "관리자 공개 콘텐츠 목록을 불러오지 못했습니다.",
    {
      method: "GET",
      headers: buildSpringBffHeaders(undefined, { userId }),
    }
  );
}

export function fetchAdminPublicContentArticleFromSpring(params: {
  userId: string;
  articleId: string;
}): Promise<PublicContentAdminArticleResponse> {
  const userId = parseAdminUserId(params.userId);
  const articleId = parseAdminArticleId(params.articleId);

  return fetchPublicContentSpring(
    PUBLIC_CONTENT_API_PATHS.adminArticle(encodeURIComponent(articleId)),
    publicContentAdminArticleResponseSchema,
    "관리자 공개 콘텐츠 글을 불러오지 못했습니다.",
    {
      method: "GET",
      headers: buildSpringBffHeaders(undefined, { userId }),
    }
  );
}

function adminMutationHeaders(userId: string) {
  return buildSpringBffHeaders(
    { "content-type": "application/json" },
    { userId: parseAdminUserId(userId) }
  );
}

export function createAdminPublicContentArticleInSpring(params: {
  userId: string;
  body: CreatePublicContentArticleBody;
}): Promise<PublicContentAdminArticleResponse> {
  const body = createPublicContentArticleBodySchema.parse(params.body);
  return fetchPublicContentSpring(
    PUBLIC_CONTENT_API_PATHS.adminList,
    publicContentAdminArticleResponseSchema,
    "공개 콘텐츠 초안을 만들지 못했습니다.",
    {
      method: "POST",
      headers: adminMutationHeaders(params.userId),
      body: JSON.stringify(body),
    }
  );
}

export function updateAdminPublicContentArticleInSpring(params: {
  userId: string;
  articleId: string;
  body: UpdatePublicContentArticleBody;
}): Promise<PublicContentAdminArticleResponse> {
  const articleId = parseAdminArticleId(params.articleId);
  const body = updatePublicContentArticleBodySchema.parse(params.body);
  return fetchPublicContentSpring(
    PUBLIC_CONTENT_API_PATHS.adminArticle(encodeURIComponent(articleId)),
    publicContentAdminArticleResponseSchema,
    "공개 콘텐츠 글을 저장하지 못했습니다.",
    {
      method: "PATCH",
      headers: adminMutationHeaders(params.userId),
      body: JSON.stringify(body),
    }
  );
}

export function transitionAdminPublicContentArticleInSpring(params: {
  userId: string;
  articleId: string;
  action: "review" | "publish" | "archive" | "restore";
  body: TransitionPublicContentArticleBody;
}): Promise<PublicContentAdminArticleResponse> {
  const articleId = parseAdminArticleId(params.articleId);
  const body = transitionPublicContentArticleBodySchema.parse(params.body);
  const paths = {
    review: PUBLIC_CONTENT_API_PATHS.adminReview,
    publish: PUBLIC_CONTENT_API_PATHS.adminPublish,
    archive: PUBLIC_CONTENT_API_PATHS.adminArchive,
    restore: PUBLIC_CONTENT_API_PATHS.adminRestore,
  } as const;
  return fetchPublicContentSpring(
    paths[params.action](encodeURIComponent(articleId)),
    publicContentAdminArticleResponseSchema,
    "공개 콘텐츠 글 상태를 변경하지 못했습니다.",
    {
      method: "POST",
      headers: adminMutationHeaders(params.userId),
      body: JSON.stringify(body),
    }
  );
}

export function fetchAdminPublicContentRevisionsFromSpring(params: {
  userId: string;
  articleId: string;
}): Promise<PublicContentRevisionListResponse> {
  const userId = parseAdminUserId(params.userId);
  const articleId = parseAdminArticleId(params.articleId);
  return fetchPublicContentSpring(
    PUBLIC_CONTENT_API_PATHS.adminRevisions(encodeURIComponent(articleId)),
    publicContentRevisionListResponseSchema,
    "공개 콘텐츠 발행 이력을 불러오지 못했습니다.",
    {
      method: "GET",
      headers: buildSpringBffHeaders(undefined, { userId }),
    }
  );
}

export async function deleteAdminPublicContentArticleInSpring(params: {
  userId: string;
  articleId: string;
  version: number;
}) {
  const userId = parseAdminUserId(params.userId);
  const articleId = parseAdminArticleId(params.articleId);
  const url = new URL(
    `${resolveSpringBackendBaseUrl()}${PUBLIC_CONTENT_API_PATHS.adminArticle(
      encodeURIComponent(articleId)
    )}`
  );
  url.searchParams.set("version", String(params.version));
  const response = await fetchYeon(url.toString(), {
    method: "DELETE",
    cache: "no-store",
    headers: buildSpringBffHeaders(undefined, { userId }),
  });
  if (!response.ok) {
    const raw = await response.text();
    throw new PublicContentSpringBackendHttpError(
      response.status,
      extractMessage(tryParseJson(raw)) ??
        "공개 콘텐츠 초안을 삭제하지 못했습니다."
    );
  }
}

export async function downloadAdminPublicContentFromSpring(params: {
  userId: string;
  articleId?: string;
  channel?: PublicContentChannel;
}): Promise<PublicContentDownload> {
  const userId = parseAdminUserId(params.userId);
  const path = params.articleId
    ? PUBLIC_CONTENT_API_PATHS.adminExport(
        encodeURIComponent(parseAdminArticleId(params.articleId))
      )
    : PUBLIC_CONTENT_API_PATHS.adminBatchExport;
  const url = new URL(`${resolveSpringBackendBaseUrl()}${path}`);
  if (params.channel) {
    url.searchParams.set(
      "channel",
      publicContentChannelSchema.parse(params.channel)
    );
  }

  let response: YeonResponse;
  try {
    response = await fetchYeon(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: buildSpringBffHeaders({ accept: "*/*" }, { userId }),
    });
  } catch {
    throw new PublicContentSpringBackendHttpError(
      503,
      "Spring backend와 연결할 수 없습니다."
    );
  }

  if (!response.ok) {
    const raw = await response.text();
    throw new PublicContentSpringBackendHttpError(
      response.status,
      extractMessage(tryParseJson(raw)) ?? "공개 콘텐츠를 내보내지 못했습니다."
    );
  }

  return {
    bytes: await response.arrayBuffer(),
    contentDisposition: response.headers.get("content-disposition"),
    contentType:
      response.headers.get("content-type") ?? "application/octet-stream",
  };
}
