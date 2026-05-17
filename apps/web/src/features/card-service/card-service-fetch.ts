import type {
  CardDeckDetailResponse,
  CardDeckDto,
  CreateCardDeckBody,
} from "@yeon/api-contract/card-decks";
import {
  type MergeGuestResponse,
  mergeGuestResponseSchema,
} from "@yeon/api-contract/card-deck-merge-guest";

const CARD_SERVICE_AUTH_ERROR_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";

function normalizeCardServiceErrorMessage(
  message: string,
  fallbackErrorMessage: string,
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
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "CardServiceApiError";
  }
}

async function readErrorMessage(
  response: Response,
  fallbackErrorMessage: string,
): Promise<string> {
  if (response.status === 401) {
    return CARD_SERVICE_AUTH_ERROR_MESSAGE;
  }

  const text = await response.text().catch(() => "");
  if (!text) return fallbackErrorMessage;

  try {
    const parsed = JSON.parse(text) as { message?: string };
    return normalizeCardServiceErrorMessage(
      parsed.message ?? "",
      fallbackErrorMessage,
    );
  } catch {
    return fallbackErrorMessage;
  }
}

async function throwIfNotOk(response: Response, fallbackErrorMessage: string) {
  if (!response.ok) {
    throw new CardServiceApiError(
      response.status,
      await readErrorMessage(response, fallbackErrorMessage),
    );
  }
}

export async function cardServiceFetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackErrorMessage: string,
): Promise<T> {
  const response = await fetch(input, { ...init, credentials: "include" });

  await throwIfNotOk(response, fallbackErrorMessage);

  return (await response.json()) as T;
}

export async function cardServiceFetchVoid(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackErrorMessage: string,
): Promise<void> {
  const response = await fetch(input, { ...init, credentials: "include" });

  await throwIfNotOk(response, fallbackErrorMessage);
}

export async function uploadCardDeckImage(
  file: File,
): Promise<{ storageKey: string; imageUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return cardServiceFetchJson<{ storageKey: string; imageUrl: string }>(
    "/api/v1/card-decks/assets",
    { method: "POST", body: formData },
    "이미지를 업로드하지 못했습니다.",
  );
}

export async function createServerCardDeck(
  body: CreateCardDeckBody,
): Promise<CardDeckDto> {
  const data = await cardServiceFetchJson<{ deck: CardDeckDto }>(
    "/api/v1/card-decks",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    "덱을 생성하지 못했습니다.",
  );
  return data.deck;
}

export async function listServerCardDecksOrNull(): Promise<
  CardDeckDto[] | null
> {
  const response = await fetch("/api/v1/card-decks", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("덱 목록을 불러오지 못했습니다.");
  }

  const data = (await response.json()) as { decks: CardDeckDto[] };
  return data.decks;
}

export async function loadServerCardDeckDetail(
  deckId: string,
): Promise<CardDeckDetailResponse> {
  return cardServiceFetchJson<CardDeckDetailResponse>(
    `/api/v1/card-decks/${deckId}`,
    {},
    "덱을 불러오지 못했습니다.",
  );
}

export async function mergeGuestCardDecksToServer(
  body: unknown,
): Promise<MergeGuestResponse> {
  const raw = await cardServiceFetchJson<unknown>(
    "/api/v1/card-decks/merge-guest",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    "덱 이관에 실패했습니다. 다시 시도해 주세요.",
  );

  return mergeGuestResponseSchema.parse(raw);
}
