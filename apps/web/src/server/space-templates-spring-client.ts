const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class SpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SpringBackendHttpError";
    this.status = status;
  }
}

export async function fetchSpaceTemplatesFromSpring(userId: string) {
  return fetchJsonFromSpring("/space-templates", userId);
}

export async function createSpaceTemplateInSpring(userId: string, body: unknown) {
  return fetchJsonFromSpring("/space-templates", userId, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function fetchSpaceTemplateDetailFromSpring(
  templateId: string,
  userId: string,
) {
  return fetchJsonFromSpring(`/space-templates/${templateId}`, userId);
}

export async function updateSpaceTemplateInSpring(
  templateId: string,
  userId: string,
  body: { name?: string; description?: string | null },
) {
  return fetchJsonFromSpring(`/space-templates/${templateId}`, userId, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function deleteSpaceTemplateInSpring(
  templateId: string,
  userId: string,
) {
  await fetchJsonFromSpring(`/space-templates/${templateId}`, userId, {
    method: "DELETE",
  });
}

export async function duplicateSpaceTemplateInSpring(
  templateId: string,
  userId: string,
) {
  return fetchJsonFromSpring(`/space-templates/${templateId}/duplicate`, userId, {
    method: "POST",
  });
}

export async function snapshotSpaceTemplateInSpring(
  spaceId: string,
  userId: string,
  body: { name: string; description?: string | null },
) {
  return fetchJsonFromSpring(`/spaces/${spaceId}/snapshot-template`, userId, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function applySpaceTemplateInSpring(
  spaceId: string,
  userId: string,
  body: { templateId: string },
) {
  return fetchJsonFromSpring(`/spaces/${spaceId}/apply-template`, userId, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

async function fetchJsonFromSpring(
  path: string,
  userId: string,
  init?: {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
  },
) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    cache: "no-store",
    method: init?.method,
    body: init?.body,
    headers: {
      accept: "application/json",
      "X-Yeon-User-Id": userId,
      ...init?.headers,
      ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
        ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
        : {}),
    },
  });

  const body = await response.text();
  const parsed = tryParseJson(body);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SpringBackendHttpError(response.status, message);
  }

  if (response.status === 204) {
    return null;
  }

  return parsed;
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
