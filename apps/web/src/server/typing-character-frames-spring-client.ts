import type { FrameSlot } from "@/features/typing-service/frame-slot";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

export class TypingCharacterFramesSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "TypingCharacterFramesSpringBackendHttpError";
    this.status = status;
  }
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

async function fetchJson(
  path: string,
  init?: RequestInit & { userId?: string | null }
) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildSpringBffHeaders(init?.headers, { userId: init?.userId }),
  });

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new TypingCharacterFramesSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다."
    );
  }

  return parsed;
}

export async function fetchTypingCharacterFrameOverridesFromSpring() {
  return fetchJson("/typing-character-frames", { method: "GET" }) as Promise<{
    overrides: Array<{ characterId: string; frameSlots: FrameSlot[] }>;
  }>;
}

export async function updateTypingCharacterFrameOverrideInSpring(params: {
  userId: string | null;
  characterId: string;
  frameSlots: FrameSlot[] | null;
}) {
  return fetchJson(
    `/typing-character-frames/${encodeURIComponent(params.characterId)}`,
    {
      method: "PUT",
      userId: params.userId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ frameSlots: params.frameSlots }),
    }
  ) as Promise<{
    override: { characterId: string; frameSlots: FrameSlot[] } | null;
  }>;
}
