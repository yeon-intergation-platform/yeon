import {
  PUBLIC_CONTENT_API_PATHS,
  publicContentArticleListResponseSchema,
  publicContentArticleResponseSchema,
  publicContentChannelSchema,
  publicContentListQuerySchema,
  publicContentSlugSchema,
  publicContentSitemapResponseSchema,
  type PublicContentArticleListResponse,
  type PublicContentArticleResponse,
  type PublicContentChannel,
  type PublicContentListQuery,
  type PublicContentSitemapResponse,
} from "@yeon/api-contract/public-content";
import {
  createYeonHeaders,
  fetchYeon,
  type YeonRequestInit,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";

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

function toQueryString(params: PublicContentListQuery) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
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
      cache: "no-store",
      headers,
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
