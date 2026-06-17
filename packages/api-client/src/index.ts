import { authSessionResponseSchema } from "@yeon/api-contract/auth";
import {
  cardDeckDetailResponseSchema,
  cardDeckItemResponseSchema,
  cardDeckListResponseSchema,
  cardDeckResponseSchema,
  cardStudyPreferenceResponseSchema,
  createCardDeckBodySchema,
  createCardDeckItemBodySchema,
  reviewCardDeckItemBodySchema,
  updateCardDeckBodySchema,
  updateCardDeckItemBodySchema,
  updateCardStudyPreferenceBodySchema,
  type CreateCardDeckBody,
  type CreateCardDeckItemBody,
  type ReviewCardDeckItemBody,
  type UpdateCardDeckBody,
  type UpdateCardDeckItemBody,
  type UpdateCardStudyPreferenceBody,
} from "@yeon/api-contract/card-decks";
import {
  chatServiceBlockProfileResponseSchema,
  chatServiceCreateAskPostBodySchema,
  chatServiceCreateAskPostResponseSchema,
  chatServiceCreateFeedPostBodySchema,
  chatServiceCreateFeedPostResponseSchema,
  chatServiceCreateReportBodySchema,
  chatServiceCreateReportResponseSchema,
  chatServiceDeleteAccountResponseSchema,
  chatServiceFriendMutationResponseSchema,
  chatServiceFriendsOverviewResponseSchema,
  chatServiceGetChatRoomResponseSchema,
  chatServiceGetProfileResponseSchema,
  chatServiceGetMyProfileResponseSchema,
  chatServiceGuestProfileRequestSchema,
  chatServiceGuestProfileResponseSchema,
  chatServiceListAskPostsResponseSchema,
  chatServiceListChatRoomsResponseSchema,
  chatServiceListFeedRepliesResponseSchema,
  chatServiceListFeedResponseSchema,
  chatServiceOpenChatBodySchema,
  chatServiceOpenChatResponseSchema,
  chatServiceRequestOtpBodySchema,
  chatServiceRequestOtpResponseSchema,
  chatServiceSendChatMessageBodySchema,
  chatServiceSendChatMessageResponseSchema,
  chatServiceSendFriendRequestBodySchema,
  chatServiceSessionResponseSchema,
  chatServiceUpdateMyProfileBodySchema,
  chatServiceUpdateMyProfileResponseSchema,
  chatServiceVerifyOtpBodySchema,
  chatServiceVerifyOtpResponseSchema,
  chatServiceVoteAskPostBodySchema,
  chatServiceVoteAskPostResponseSchema,
  type ChatServiceCreateAskPostBody,
  type ChatServiceCreateFeedPostBody,
  type ChatServiceCreateReportBody,
  type ChatServiceOpenChatBody,
  type ChatServiceRequestOtpBody,
  type ChatServiceSendChatMessageBody,
  type ChatServiceSendFriendRequestBody,
  type ChatServiceUpdateMyProfileBody,
  type ChatServiceVerifyOtpBody,
  type ChatServiceVoteAskPostBody,
} from "@yeon/api-contract/chat-service";
import { contestOverviewResponseSchema } from "@yeon/api-contract/contest";
import {
  credentialLoginBodySchema,
  mobileCredentialLoginResponseSchema,
  type CredentialLoginBody,
} from "@yeon/api-contract/credential";
import {
  createTypingDeckBodySchema,
  createTypingDeckPassageBodySchema,
  createTypingDeckPassagesBodySchema,
  createTypingRaceSeedBodySchema,
  createTypingDeckPassagesResponseSchema,
  typingDeckDetailResponseSchema,
  typingDeckListResponseSchema,
  typingDeckPassageResponseSchema,
  typingDeckResponseSchema,
  typingRaceSeedResponseSchema,
  updateTypingDeckBodySchema,
  updateTypingDeckPassageBodySchema,
  type CreateTypingDeckBody,
  type CreateTypingDeckPassageBody,
  type CreateTypingDeckPassagesBody,
  type CreateTypingRaceSeedBody,
  type TypingDeckListQuery,
  type UpdateTypingDeckBody,
  type UpdateTypingDeckPassageBody,
} from "@yeon/api-contract/typing-decks";
import { errorResponseSchema } from "@yeon/api-contract/error";
import { healthResponseSchema } from "@yeon/api-contract/health";
import {
  LIFE_OS_API_PATHS,
  lifeOsDayResponseSchema,
  lifeOsDaysResponseSchema,
  lifeOsReportResponseSchema,
  upsertLifeOsDayBodySchema,
  type UpsertLifeOsDayBody,
} from "@yeon/api-contract/life-os";
import {
  archivePublicContentArticleBodySchema,
  createPublicContentArticleBodySchema,
  PUBLIC_CONTENT_API_PATHS,
  publicContentAdminArticleListResponseSchema,
  publicContentAdminArticleResponseSchema,
  publicContentAdminListQuerySchema,
  publicContentArticleListResponseSchema,
  publicContentArticleResponseSchema,
  publicContentChannelSchema,
  publicContentListQuerySchema,
  publicContentSlugSchema,
  publicContentSitemapResponseSchema,
  publishPublicContentArticleBodySchema,
  updatePublicContentArticleBodySchema,
  type ArchivePublicContentArticleBody,
  type CreatePublicContentArticleBody,
  type PublicContentAdminListQuery,
  type PublicContentChannel,
  type PublicContentListQuery,
  type PublishPublicContentArticleBody,
  type UpdatePublicContentArticleBody,
} from "@yeon/api-contract/public-content";
import {
  createUserResponseSchema,
  listUsersResponseSchema,
  type CreateUserBody,
} from "@yeon/api-contract/users";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type FetchLike = typeof fetch;

type ApiClientOptions = {
  baseUrl?: string;
  fetch?: FetchLike;
  headers?: HeadersInit;
};

type ParseableSchema<TSchema> = {
  parse(input: unknown): TSchema;
};

type RequestOptions<TSchema> = {
  path: string;
  schema: ParseableSchema<TSchema>;
  init?: RequestInit;
};

function joinUrl(baseUrl: string, path: string) {
  if (!baseUrl) {
    return path;
  }

  return new URL(path, baseUrl).toString();
}

async function parseErrorResponse(response: Response) {
  try {
    const data = await response.json();
    const parsed = errorResponseSchema.safeParse(data);

    if (parsed.success) {
      return parsed.data.message;
    }
  } catch (error) {
    console.warn("[api-client] 오류 응답 파싱 실패", error);
    return null;
  }

  return null;
}

const CHAT_SERVICE_GUEST_SESSION_PREFIX = "guest:";

function parseGuestProfileId(sessionToken?: string) {
  if (!sessionToken?.startsWith(CHAT_SERVICE_GUEST_SESSION_PREFIX)) {
    return null;
  }

  return sessionToken.slice(CHAT_SERVICE_GUEST_SESSION_PREFIX.length);
}

function createChatServiceHeaders(sessionToken?: string): HeadersInit {
  const guestProfileId = parseGuestProfileId(sessionToken);

  if (guestProfileId) {
    return {
      "X-Yeon-Chat-Profile-Id": guestProfileId,
    };
  }

  if (!sessionToken) {
    return {};
  }

  return {
    authorization: `Bearer ${sessionToken}`,
  };
}

function toQueryString(params: Record<string, string | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
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

function createAuthSessionHeaders(sessionToken?: string): HeadersInit {
  if (!sessionToken) {
    return {};
  }

  return {
    authorization: `Bearer ${sessionToken}`,
  };
}

export function createApiClient(options: ApiClientOptions = {}) {
  const fetchImpl = options.fetch ?? fetch;
  const baseUrl = options.baseUrl ?? "";
  const defaultHeaders = options.headers;

  async function request<TSchema>({
    path,
    schema,
    init,
  }: RequestOptions<TSchema>) {
    const response = await fetchImpl(joinUrl(baseUrl, path), {
      ...init,
      headers: {
        "content-type": "application/json",
        ...defaultHeaders,
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const message =
        (await parseErrorResponse(response)) ?? "API 요청 처리에 실패했습니다.";

      throw new ApiClientError(response.status, message);
    }

    const data = await response.json();

    return schema.parse(data);
  }

  async function requestNoContent(path: string, init?: RequestInit) {
    const response = await fetchImpl(joinUrl(baseUrl, path), {
      ...init,
      headers: {
        "content-type": "application/json",
        ...defaultHeaders,
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const message =
        (await parseErrorResponse(response)) ?? "API 요청 처리에 실패했습니다.";

      throw new ApiClientError(response.status, message);
    }
  }

  return {
    getHealth() {
      return request({
        path: "/api/health",
        schema: healthResponseSchema,
      });
    },
    getAuthSession(sessionToken?: string) {
      return request({
        path: "/api/v1/auth/session",
        schema: authSessionResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    async logout(sessionToken?: string) {
      await request({
        path: "/api/v1/auth/session",
        schema: authSessionResponseSchema,
        init: {
          method: "DELETE",
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    loginWithCredential(body: CredentialLoginBody) {
      const parsedBody = credentialLoginBodySchema.parse(body);

      return request({
        path: "/api/v1/mobile/auth/credentials/login",
        schema: mobileCredentialLoginResponseSchema,
        init: {
          method: "POST",
          body: JSON.stringify(parsedBody),
        },
      });
    },
    getContestOverview() {
      return request({
        path: "/api/v1/contest/overview",
        schema: contestOverviewResponseSchema,
      });
    },
    listCardDecks(sessionToken?: string) {
      return request({
        path: "/api/v1/card-decks",
        schema: cardDeckListResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    createCardDeck(body: CreateCardDeckBody, sessionToken?: string) {
      const parsedBody = createCardDeckBodySchema.parse(body);

      return request({
        path: "/api/v1/card-decks",
        schema: cardDeckResponseSchema,
        init: {
          method: "POST",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    getCardDeckDetail(deckId: string, sessionToken?: string) {
      return request({
        path: `/api/v1/card-decks/${deckId}`,
        schema: cardDeckDetailResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    updateCardDeck(
      deckId: string,
      body: UpdateCardDeckBody,
      sessionToken?: string
    ) {
      const parsedBody = updateCardDeckBodySchema.parse(body);

      return request({
        path: `/api/v1/card-decks/${deckId}`,
        schema: cardDeckResponseSchema,
        init: {
          method: "PATCH",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    deleteCardDeck(deckId: string, sessionToken?: string) {
      return requestNoContent(`/api/v1/card-decks/${deckId}`, {
        method: "DELETE",
        headers: createAuthSessionHeaders(sessionToken),
      });
    },
    createCardDeckItem(
      deckId: string,
      body: CreateCardDeckItemBody,
      sessionToken?: string
    ) {
      const parsedBody = createCardDeckItemBodySchema.parse(body);

      return request({
        path: `/api/v1/card-decks/${deckId}/items`,
        schema: cardDeckItemResponseSchema,
        init: {
          method: "POST",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    updateCardDeckItem(
      deckId: string,
      itemId: string,
      body: UpdateCardDeckItemBody,
      sessionToken?: string
    ) {
      const parsedBody = updateCardDeckItemBodySchema.parse(body);

      return request({
        path: `/api/v1/card-decks/${deckId}/items/${itemId}`,
        schema: cardDeckItemResponseSchema,
        init: {
          method: "PATCH",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    deleteCardDeckItem(deckId: string, itemId: string, sessionToken?: string) {
      return requestNoContent(`/api/v1/card-decks/${deckId}/items/${itemId}`, {
        method: "DELETE",
        headers: createAuthSessionHeaders(sessionToken),
      });
    },
    getCardStudyPreference(sessionToken?: string) {
      return request({
        path: "/api/v1/card-decks/study-preference",
        schema: cardStudyPreferenceResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    updateCardStudyPreference(
      body: UpdateCardStudyPreferenceBody,
      sessionToken?: string
    ) {
      const parsedBody = updateCardStudyPreferenceBodySchema.parse(body);

      return request({
        path: "/api/v1/card-decks/study-preference",
        schema: cardStudyPreferenceResponseSchema,
        init: {
          method: "PATCH",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    reviewCardDeckItem(
      deckId: string,
      itemId: string,
      body: ReviewCardDeckItemBody,
      sessionToken?: string
    ) {
      const parsedBody = reviewCardDeckItemBodySchema.parse(body);

      return request({
        path: `/api/v1/card-decks/${deckId}/items/${itemId}/review`,
        schema: cardDeckItemResponseSchema,
        init: {
          method: "POST",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    listTypingDecks(
      query: TypingDeckListQuery = { scope: "all", includeDefaults: false },
      sessionToken?: string
    ) {
      return request({
        path: `/api/v1/typing-decks${toQueryString({
          scope: query.scope,
          languageTag: query.languageTag,
          includeDefaults: query.includeDefaults,
        })}`,
        schema: typingDeckListResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    createTypingDeck(body: CreateTypingDeckBody, sessionToken?: string) {
      const parsedBody = createTypingDeckBodySchema.parse(body);

      return request({
        path: "/api/v1/typing-decks",
        schema: typingDeckResponseSchema,
        init: {
          method: "POST",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    getTypingDeckDetail(deckId: string, sessionToken?: string) {
      return request({
        path: `/api/v1/typing-decks/${deckId}`,
        schema: typingDeckDetailResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    updateTypingDeck(
      deckId: string,
      body: UpdateTypingDeckBody,
      sessionToken?: string
    ) {
      const parsedBody = updateTypingDeckBodySchema.parse(body);

      return request({
        path: `/api/v1/typing-decks/${deckId}`,
        schema: typingDeckResponseSchema,
        init: {
          method: "PATCH",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    deleteTypingDeck(deckId: string, sessionToken?: string) {
      return requestNoContent(`/api/v1/typing-decks/${deckId}`, {
        method: "DELETE",
        headers: createAuthSessionHeaders(sessionToken),
      });
    },
    createTypingDeckPassage(
      deckId: string,
      body: CreateTypingDeckPassageBody,
      sessionToken?: string
    ) {
      const parsedBody = createTypingDeckPassageBodySchema.parse(body);

      return request({
        path: `/api/v1/typing-decks/${deckId}/passages`,
        schema: typingDeckPassageResponseSchema,
        init: {
          method: "POST",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    createTypingDeckPassages(
      deckId: string,
      body: CreateTypingDeckPassagesBody,
      sessionToken?: string
    ) {
      const parsedBody = createTypingDeckPassagesBodySchema.parse(body);

      return request({
        path: `/api/v1/typing-decks/${deckId}/passages/bulk`,
        schema: createTypingDeckPassagesResponseSchema,
        init: {
          method: "POST",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    updateTypingDeckPassage(
      deckId: string,
      passageId: string,
      body: UpdateTypingDeckPassageBody,
      sessionToken?: string
    ) {
      const parsedBody = updateTypingDeckPassageBodySchema.parse(body);

      return request({
        path: `/api/v1/typing-decks/${deckId}/passages/${passageId}`,
        schema: typingDeckPassageResponseSchema,
        init: {
          method: "PATCH",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    deleteTypingDeckPassage(
      deckId: string,
      passageId: string,
      sessionToken?: string
    ) {
      return requestNoContent(
        `/api/v1/typing-decks/${deckId}/passages/${passageId}`,
        {
          method: "DELETE",
          headers: createAuthSessionHeaders(sessionToken),
        }
      );
    },
    createTypingRaceSeed(
      deckId: string,
      body: CreateTypingRaceSeedBody = {},
      sessionToken?: string
    ) {
      const parsedBody = createTypingRaceSeedBodySchema.parse(body);

      return request({
        path: `/api/v1/typing-decks/${deckId}/race-seed`,
        schema: typingRaceSeedResponseSchema,
        init: {
          method: "POST",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    listLifeOsDays(sessionToken?: string) {
      return request({
        path: LIFE_OS_API_PATHS.days,
        schema: lifeOsDaysResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    getLifeOsDay(localDate: string, sessionToken?: string) {
      return request({
        path: LIFE_OS_API_PATHS.dayByDate(localDate),
        schema: lifeOsDayResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    upsertLifeOsDay(body: UpsertLifeOsDayBody, sessionToken?: string) {
      const parsedBody = upsertLifeOsDayBodySchema.parse(body);

      return request({
        path: LIFE_OS_API_PATHS.dayByDate(parsedBody.localDate),
        schema: lifeOsDayResponseSchema,
        init: {
          method: "PUT",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    getLifeOsDailyReport(localDate: string, sessionToken?: string) {
      return request({
        path: LIFE_OS_API_PATHS.dailyReport(localDate),
        schema: lifeOsReportResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    getLifeOsWeeklyReport(
      periodStart: string,
      periodEnd: string,
      sessionToken?: string
    ) {
      return request({
        path: LIFE_OS_API_PATHS.weeklyReport(periodStart, periodEnd),
        schema: lifeOsReportResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    listUsers() {
      return request({
        path: "/api/v1/users",
        schema: listUsersResponseSchema,
      });
    },
    createUser(body: CreateUserBody) {
      return request({
        path: "/api/v1/users",
        schema: createUserResponseSchema,
        init: {
          method: "POST",
          body: JSON.stringify(body),
        },
      });
    },
    listPublicContentArticles(query: PublicContentListQuery = {}) {
      const parsedQuery = publicContentListQuerySchema.parse(query);

      return request({
        path: `${PUBLIC_CONTENT_API_PATHS.publicList}${toQueryString(parsedQuery)}`,
        schema: publicContentArticleListResponseSchema,
      });
    },
    getPublicContentArticle(channel: PublicContentChannel, slug: string) {
      const parsedChannel = publicContentChannelSchema.parse(channel);
      const parsedSlug = publicContentSlugSchema.parse(slug);

      return request({
        path: PUBLIC_CONTENT_API_PATHS.publicArticle(
          parsedChannel,
          encodePathSegments(parsedSlug)
        ),
        schema: publicContentArticleResponseSchema,
      });
    },
    getPublicContentSitemap(channel: PublicContentChannel) {
      const parsedChannel = publicContentChannelSchema.parse(channel);

      return request({
        path: PUBLIC_CONTENT_API_PATHS.publicSitemap(parsedChannel),
        schema: publicContentSitemapResponseSchema,
      });
    },
    listAdminPublicContentArticles(
      query: PublicContentAdminListQuery = {},
      sessionToken?: string
    ) {
      const parsedQuery = publicContentAdminListQuerySchema.parse(query);

      return request({
        path: `${PUBLIC_CONTENT_API_PATHS.adminList}${toQueryString(parsedQuery)}`,
        schema: publicContentAdminArticleListResponseSchema,
        init: {
          headers: createAuthSessionHeaders(sessionToken),
        },
      });
    },
    createPublicContentArticle(
      body: CreatePublicContentArticleBody,
      sessionToken?: string
    ) {
      const parsedBody = createPublicContentArticleBodySchema.parse(body);

      return request({
        path: PUBLIC_CONTENT_API_PATHS.adminList,
        schema: publicContentAdminArticleResponseSchema,
        init: {
          method: "POST",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    updatePublicContentArticle(
      articleId: string,
      body: UpdatePublicContentArticleBody,
      sessionToken?: string
    ) {
      const parsedBody = updatePublicContentArticleBodySchema.parse(body);

      return request({
        path: PUBLIC_CONTENT_API_PATHS.adminArticle(
          encodeURIComponent(articleId)
        ),
        schema: publicContentAdminArticleResponseSchema,
        init: {
          method: "PATCH",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    publishPublicContentArticle(
      articleId: string,
      body: PublishPublicContentArticleBody = {},
      sessionToken?: string
    ) {
      const parsedBody = publishPublicContentArticleBodySchema.parse(body);

      return request({
        path: PUBLIC_CONTENT_API_PATHS.adminPublish(
          encodeURIComponent(articleId)
        ),
        schema: publicContentAdminArticleResponseSchema,
        init: {
          method: "POST",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    archivePublicContentArticle(
      articleId: string,
      body: ArchivePublicContentArticleBody = {},
      sessionToken?: string
    ) {
      const parsedBody = archivePublicContentArticleBodySchema.parse(body);

      return request({
        path: PUBLIC_CONTENT_API_PATHS.adminArchive(
          encodeURIComponent(articleId)
        ),
        schema: publicContentAdminArticleResponseSchema,
        init: {
          method: "POST",
          headers: createAuthSessionHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    requestChatServiceOtp(body: ChatServiceRequestOtpBody) {
      const parsedBody = chatServiceRequestOtpBodySchema.parse(body);

      return request({
        path: "/api/v1/chat-service/auth/request-otp",
        schema: chatServiceRequestOtpResponseSchema,
        init: {
          method: "POST",
          body: JSON.stringify(parsedBody),
        },
      });
    },
    verifyChatServiceOtp(body: ChatServiceVerifyOtpBody) {
      const parsedBody = chatServiceVerifyOtpBodySchema.parse(body);

      return request({
        path: "/api/v1/chat-service/auth/verify-otp",
        schema: chatServiceVerifyOtpResponseSchema,
        init: {
          method: "POST",
          body: JSON.stringify(parsedBody),
        },
      });
    },
    resolveChatServiceGuestProfile(body: {
      guestNickname: string;
      guestPassword: string;
    }) {
      const parsedBody = chatServiceGuestProfileRequestSchema.parse(body);

      return request({
        path: "/api/v1/chat-service/auth/guest-profile",
        schema: chatServiceGuestProfileResponseSchema,
        init: {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(parsedBody),
        },
      });
    },
    getChatServiceSession(sessionToken?: string) {
      return request({
        path: "/api/v1/chat-service/auth/session",
        schema: chatServiceSessionResponseSchema,
        init: {
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    logoutChatService(sessionToken?: string) {
      return request({
        path: "/api/v1/chat-service/auth/session",
        schema: chatServiceSessionResponseSchema,
        init: {
          method: "DELETE",
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    listChatServiceFeed(sessionToken: string) {
      return request({
        path: "/api/v1/chat-service/feed",
        schema: chatServiceListFeedResponseSchema,
        init: {
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    createChatServiceFeedPost(
      sessionToken: string,
      body: ChatServiceCreateFeedPostBody
    ) {
      const parsedBody = chatServiceCreateFeedPostBodySchema.parse(body);

      return request({
        path: "/api/v1/chat-service/feed",
        schema: chatServiceCreateFeedPostResponseSchema,
        init: {
          method: "POST",
          headers: createChatServiceHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    listChatServiceFeedReplies(sessionToken: string, postId: string) {
      return request({
        path: `/api/v1/chat-service/feed/${postId}/replies`,
        schema: chatServiceListFeedRepliesResponseSchema,
        init: {
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    replyToChatServiceFeedPost(
      sessionToken: string,
      postId: string,
      body: ChatServiceCreateFeedPostBody
    ) {
      const parsedBody = chatServiceCreateFeedPostBodySchema.parse(body);

      return request({
        path: `/api/v1/chat-service/feed/${postId}/replies`,
        schema: chatServiceCreateFeedPostResponseSchema,
        init: {
          method: "POST",
          headers: createChatServiceHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    listChatServiceAskPosts(sessionToken: string) {
      return request({
        path: "/api/v1/chat-service/ask",
        schema: chatServiceListAskPostsResponseSchema,
        init: {
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    createChatServiceAskPost(
      sessionToken: string,
      body: ChatServiceCreateAskPostBody
    ) {
      const parsedBody = chatServiceCreateAskPostBodySchema.parse(body);

      return request({
        path: "/api/v1/chat-service/ask",
        schema: chatServiceCreateAskPostResponseSchema,
        init: {
          method: "POST",
          headers: createChatServiceHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    voteChatServiceAskPost(
      sessionToken: string,
      postId: string,
      body: ChatServiceVoteAskPostBody
    ) {
      const parsedBody = chatServiceVoteAskPostBodySchema.parse(body);

      return request({
        path: `/api/v1/chat-service/ask/${postId}/vote`,
        schema: chatServiceVoteAskPostResponseSchema,
        init: {
          method: "POST",
          headers: createChatServiceHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    getChatServiceFriendsOverview(sessionToken: string) {
      return request({
        path: "/api/v1/chat-service/friends/overview",
        schema: chatServiceFriendsOverviewResponseSchema,
        init: {
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    sendChatServiceFriendRequest(
      sessionToken: string,
      body: ChatServiceSendFriendRequestBody
    ) {
      const parsedBody = chatServiceSendFriendRequestBodySchema.parse(body);

      return request({
        path: "/api/v1/chat-service/friends/requests",
        schema: chatServiceFriendMutationResponseSchema,
        init: {
          method: "POST",
          headers: createChatServiceHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    openChatServiceRoom(sessionToken: string, body: ChatServiceOpenChatBody) {
      const parsedBody = chatServiceOpenChatBodySchema.parse(body);

      return request({
        path: "/api/v1/chat-service/chat/open",
        schema: chatServiceOpenChatResponseSchema,
        init: {
          method: "POST",
          headers: createChatServiceHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    listChatServiceRooms(sessionToken: string) {
      return request({
        path: "/api/v1/chat-service/chat/rooms",
        schema: chatServiceListChatRoomsResponseSchema,
        init: {
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    getChatServiceRoom(sessionToken: string, roomId: string) {
      return request({
        path: `/api/v1/chat-service/chat/rooms/${roomId}`,
        schema: chatServiceGetChatRoomResponseSchema,
        init: {
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    sendChatServiceMessage(
      sessionToken: string,
      roomId: string,
      body: ChatServiceSendChatMessageBody
    ) {
      const parsedBody = chatServiceSendChatMessageBodySchema.parse(body);

      return request({
        path: `/api/v1/chat-service/chat/rooms/${roomId}/messages`,
        schema: chatServiceSendChatMessageResponseSchema,
        init: {
          method: "POST",
          headers: createChatServiceHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    getMyChatServiceProfile(sessionToken: string) {
      return request({
        path: "/api/v1/chat-service/profile/me",
        schema: chatServiceGetMyProfileResponseSchema,
        init: {
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    getChatServiceProfile(sessionToken: string, profileId: string) {
      return request({
        path: `/api/v1/chat-service/profiles/${profileId}`,
        schema: chatServiceGetProfileResponseSchema,
        init: {
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    updateMyChatServiceProfile(
      sessionToken: string,
      body: ChatServiceUpdateMyProfileBody
    ) {
      const parsedBody = chatServiceUpdateMyProfileBodySchema.parse(body);

      return request({
        path: "/api/v1/chat-service/profile/me",
        schema: chatServiceUpdateMyProfileResponseSchema,
        init: {
          method: "PATCH",
          headers: createChatServiceHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    deleteMyChatServiceProfile(sessionToken: string) {
      return request({
        path: "/api/v1/chat-service/profile/me",
        schema: chatServiceDeleteAccountResponseSchema,
        init: {
          method: "DELETE",
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    createChatServiceReport(
      sessionToken: string,
      body: ChatServiceCreateReportBody
    ) {
      const parsedBody = chatServiceCreateReportBodySchema.parse(body);

      return request({
        path: "/api/v1/chat-service/reports",
        schema: chatServiceCreateReportResponseSchema,
        init: {
          method: "POST",
          headers: createChatServiceHeaders(sessionToken),
          body: JSON.stringify(parsedBody),
        },
      });
    },
    blockChatServiceProfile(sessionToken: string, profileId: string) {
      return request({
        path: `/api/v1/chat-service/profiles/${profileId}/block`,
        schema: chatServiceBlockProfileResponseSchema,
        init: {
          method: "POST",
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
    unblockChatServiceProfile(sessionToken: string, profileId: string) {
      return request({
        path: `/api/v1/chat-service/profiles/${profileId}/block`,
        schema: chatServiceBlockProfileResponseSchema,
        init: {
          method: "DELETE",
          headers: createChatServiceHeaders(sessionToken),
        },
      });
    },
  };
}
