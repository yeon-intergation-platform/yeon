import type {
  CardDeckAssetUploadResponse,
  CardDeckListResponse,
  CardDeckDetailResponse,
  CardDeckDto,
  CreateCardDeckBody,
} from "@yeon/api-contract/card-decks";
import {
  cardDeckAssetUploadResponseSchema,
  cardDeckDetailResponseSchema,
  cardDeckListResponseSchema,
  cardDeckResponseSchema,
} from "@yeon/api-contract/card-decks";
import {
  type MergeGuestResponse,
  mergeGuestResponseSchema,
} from "@yeon/api-contract/card-deck-merge-guest";
import {
  errorResponseSchema,
  type ErrorResponseMeta,
} from "@yeon/api-contract/error";
import {
  createYeonFormData,
  fetchYeon,
  type YeonFetchInput,
  type YeonRequestInit,
  type YeonFile,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

const CARD_SERVICE_AUTH_ERROR_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";

function normalizeCardServiceErrorMessage(
  message: string,
  fallbackErrorMessage: string
) {
  if (!message) {
    return fallbackErrorMessage;
  }

  if (/spring|backend/i.test(message)) {
    return fallbackErrorMessage;
  }

  return message;
}

export class CardServiceApiError extends Error {
  /** 백엔드 분기용 고정 식별자. 없을 수 있다. */
  public readonly code?: string;
  /** code + 상황별 확장 메타데이터. */
  public readonly detail?: ErrorResponseMeta;

  constructor(
    public readonly status: number,
    message: string,
    detail?: ErrorResponseMeta
  ) {
    super(message);
    this.name = "CardServiceApiError";
    this.code = detail?.code;
    this.detail = detail;
  }
}

type CardServiceErrorBody = {
  message: string;
  detail: ErrorResponseMeta;
};

type CardServiceResponseSchema<T> = {
  safeParse: (value: unknown) =>
    | {
        success: true;
        data: T;
      }
    | {
        success: false;
      };
};

function createInvalidCardServiceResponseError(
  fallbackErrorMessage: string,
  code: string
) {
  return new CardServiceApiError(502, fallbackErrorMessage, { code });
}

async function readError(
  response: YeonResponse,
  fallbackErrorMessage: string
): Promise<CardServiceErrorBody> {
  if (response.status === 401) {
    return { message: CARD_SERVICE_AUTH_ERROR_MESSAGE, detail: {} };
  }

  const text = await response.text().catch(() => "");
  if (!text) return { message: fallbackErrorMessage, detail: {} };

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { message: fallbackErrorMessage, detail: {} };
    }
    throw error;
  }

  const parsed = errorResponseSchema.safeParse(json);
  if (!parsed.success) {
    return { message: fallbackErrorMessage, detail: {} };
  }

  const { message, ...detail } = parsed.data;
  return {
    message: normalizeCardServiceErrorMessage(message, fallbackErrorMessage),
    detail,
  };
}

async function throwIfNotOk(
  response: YeonResponse,
  fallbackErrorMessage: string
) {
  if (!response.ok) {
    const { message, detail } = await readError(response, fallbackErrorMessage);
    throw new CardServiceApiError(response.status, message, detail);
  }
}

export async function cardServiceFetchJson<T>(
  input: YeonFetchInput,
  init: YeonRequestInit,
  fallbackErrorMessage: string,
  schema?: CardServiceResponseSchema<T>
): Promise<T> {
  const response = await fetchYeon(input, { ...init, credentials: "include" });

  await throwIfNotOk(response, fallbackErrorMessage);

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw createInvalidCardServiceResponseError(
        fallbackErrorMessage,
        "CARD_SERVICE_INVALID_JSON_RESPONSE"
      );
    }
    throw error;
  }

  if (!schema) {
    return data as T;
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw createInvalidCardServiceResponseError(
      fallbackErrorMessage,
      "CARD_SERVICE_INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function cardServiceFetchVoid(
  input: YeonFetchInput,
  init: YeonRequestInit,
  fallbackErrorMessage: string
): Promise<void> {
  const response = await fetchYeon(input, { ...init, credentials: "include" });

  await throwIfNotOk(response, fallbackErrorMessage);
}

export async function uploadCardDeckImage(
  file: YeonFile
): Promise<CardDeckAssetUploadResponse> {
  const formData = createYeonFormData();
  formData.append("file", file);
  return cardServiceFetchJson<CardDeckAssetUploadResponse>(
    "/api/v1/card-decks/assets",
    { method: "POST", body: formData },
    "이미지를 업로드하지 못했습니다.",
    cardDeckAssetUploadResponseSchema
  );
}

export async function createServerCardDeck(
  body: CreateCardDeckBody
): Promise<CardDeckDto> {
  const data = await cardServiceFetchJson(
    "/api/v1/card-decks",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    "덱을 생성하지 못했습니다.",
    cardDeckResponseSchema
  );
  return data.deck;
}

export async function listServerCardDecksOrNull(): Promise<
  CardDeckDto[] | null
> {
  const response = await fetchYeon("/api/v1/card-decks", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    const fallbackErrorMessage = "덱 목록을 불러오지 못했습니다.";
    const { message, detail } = await readError(response, fallbackErrorMessage);
    throw new CardServiceApiError(response.status, message, detail);
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw createInvalidCardServiceResponseError(
        "덱 목록을 불러오지 못했습니다.",
        "CARD_DECK_LIST_INVALID_JSON_RESPONSE"
      );
    }
    throw error;
  }

  const parsed = cardDeckListResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw createInvalidCardServiceResponseError(
      "덱 목록을 불러오지 못했습니다.",
      "CARD_DECK_LIST_INVALID_RESPONSE"
    );
  }

  const data: CardDeckListResponse = parsed.data;
  return data.decks;
}

export async function loadServerCardDeckDetail(
  deckId: string
): Promise<CardDeckDetailResponse> {
  return cardServiceFetchJson(
    `/api/v1/card-decks/${deckId}`,
    {},
    "덱을 불러오지 못했습니다.",
    cardDeckDetailResponseSchema
  );
}

export async function mergeGuestCardDecksToServer(
  body: unknown
): Promise<MergeGuestResponse> {
  return cardServiceFetchJson(
    "/api/v1/card-decks/merge-guest",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    "덱 이관에 실패했습니다. 다시 시도해 주세요.",
    mergeGuestResponseSchema
  );
}
