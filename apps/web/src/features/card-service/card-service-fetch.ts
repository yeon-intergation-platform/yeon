import type {
  CardDeckAssetUploadResponse,
  CardDeckDetailResponse,
  CardDeckDto,
  CreateCardDeckBody,
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
  fallbackErrorMessage: string
): Promise<T> {
  const response = await fetchYeon(input, { ...init, credentials: "include" });

  await throwIfNotOk(response, fallbackErrorMessage);

  return (await response.json()) as T;
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
    "이미지를 업로드하지 못했습니다."
  );
}

export async function createServerCardDeck(
  body: CreateCardDeckBody
): Promise<CardDeckDto> {
  const data = await cardServiceFetchJson<{ deck: CardDeckDto }>(
    "/api/v1/card-decks",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    "덱을 생성하지 못했습니다."
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

  const data = (await response.json()) as { decks: CardDeckDto[] };
  return data.decks;
}

export async function loadServerCardDeckDetail(
  deckId: string
): Promise<CardDeckDetailResponse> {
  return cardServiceFetchJson<CardDeckDetailResponse>(
    `/api/v1/card-decks/${deckId}`,
    {},
    "덱을 불러오지 못했습니다."
  );
}

export async function mergeGuestCardDecksToServer(
  body: unknown
): Promise<MergeGuestResponse> {
  const raw = await cardServiceFetchJson<unknown>(
    "/api/v1/card-decks/merge-guest",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    "덱 이관에 실패했습니다. 다시 시도해 주세요."
  );

  return mergeGuestResponseSchema.parse(raw);
}
