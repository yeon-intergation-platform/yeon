import {
  createYeonFormData,
  fetchYeon,
  type YeonFile,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { extractSpringErrorCode } from "./spring-error";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

export class CardDeckAssetsSpringBackendHttpError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "CardDeckAssetsSpringBackendHttpError";
    this.status = status;
    this.code = code;
  }
}

function internalHeaders(): Record<string, string> {
  const token = process.env.SPRING_INTERNAL_TOKEN?.trim();
  return token ? { [INTERNAL_TOKEN_HEADER]: token } : {};
}

function tryParseJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractErrorMessage(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return null;
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

async function readError(response: YeonResponse, fallback: string) {
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  return new CardDeckAssetsSpringBackendHttpError(
    response.status,
    extractErrorMessage(parsed) ?? fallback,
    extractSpringErrorCode(parsed)
  );
}

export async function uploadCardDeckAssetToSpring(file: YeonFile) {
  const formData = createYeonFormData();
  formData.set("file", file);

  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}/card-decks/assets`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        ...internalHeaders(),
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw await readError(response, "이미지를 업로드하지 못했습니다.");
  }

  return (await response.json()) as { storageKey: string; imageUrl: string };
}

export async function fetchCardDeckAssetFromSpring(storageKey: string) {
  // storageKey의 '/'는 실제 경로 구분자로 보존한다. 통째로 encodeURIComponent하면 %2F가
  // 되어 Spring Security StrictHttpFirewall이 400으로 차단한다(이미지가 안 뜨는 원인).
  // 세그먼트 단위로만 인코딩해 슬래시는 살리고 그 외 문자만 안전 처리한다.
  const encodedPath = storageKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}/card-decks/assets/${encodedPath}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        ...internalHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw await readError(response, "이미지를 불러오지 못했습니다.");
  }

  return response;
}
