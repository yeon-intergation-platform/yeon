import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { resolveAppHrefForBasePath } from "@/lib/app-route-paths";
import { DEFAULT_COUNSELING_SERVICE_HREF } from "@/lib/platform-services";
import { ServiceError } from "@/server/errors/service-error";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  ImportCommitSpringBackendHttpError,
  runImportCommitInSpring,
} from "@/server/import-commit-spring-client";
import {
  LocalImportAnalysisSpringBackendHttpError,
  runLocalImportAnalyzeInSpring,
} from "@/server/local-import-analysis-spring-client";

const localImportStudentSchema = z.object({
  name: z.string().min(1),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  status: z.string().nullish(),
  customFields: z.record(z.string(), z.string().nullish()).nullish(),
});

const localImportCohortSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  students: z.array(localImportStudentSchema),
});

const importPreviewBodySchema = z.object({
  cohorts: z.array(localImportCohortSchema),
});

const importRequestSchema = z.object({
  draftId: z.string().min(1).optional(),
  preview: importPreviewBodySchema,
});

const cloudAnalyzeRequestSchema = z.object({
  draftId: z.string().min(1).optional(),
  fileId: z.string().min(1).optional(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().nonnegative().optional(),
  lastModifiedAt: z.string().optional(),
  instruction: z.string().optional(),
  previousResult: z.unknown().optional(),
  spaceId: z.string().optional(),
});

type CloudProvider = "onedrive" | "googledrive";

type CloudAnalyzeRequest = z.infer<typeof cloudAnalyzeRequestSchema>;

interface HandleImportCommitRouteParams {
  request: NextRequest;
  userId: string;
}

interface HandleCloudAnalyzeRouteParams {
  request: NextRequest;
  userId: string;
  provider: CloudProvider;
  providerLabel: string;
  getAccessToken: (userId: string) => Promise<string | null>;
  downloadFile: (
    accessToken: string,
    fileId: string,
    mimeType: string
  ) => Promise<Buffer>;
  requireMimeType: boolean;
}

interface HandleProviderStatusRouteParams<T extends Record<string, unknown>> {
  userId: string;
  getPayload: (userId: string) => Promise<T>;
  failureMessage: string;
}

interface HandleProviderFilesRouteParams<TFile> {
  request: NextRequest;
  userId: string;
  getAccessToken: (userId: string) => Promise<string | null>;
  listFiles: (accessToken: string, folderId?: string) => Promise<TFile[]>;
  disconnectedMessage: string;
  failureMessage: string;
}

interface HandleProviderFileProxyRouteParams {
  userId: string;
  fileId: string;
  mimeType: string;
  getAccessToken: (userId: string) => Promise<string | null>;
  downloadFile: (
    accessToken: string,
    fileId: string,
    mimeType: string
  ) => Promise<Buffer>;
  disconnectedMessage: string;
  logLabel: string;
  resolveContentType?: (mimeType: string) => string;
}

interface HandleOAuthStartRouteParams {
  userId: string;
  providerKey: CloudProvider;
  getOAuthUrl: (state: string) => string | Promise<string>;
  failureMessage: string;
}

interface ResolveOAuthCallbackContextParams {
  request: NextRequest;
  providerKey: CloudProvider;
}

type OAuthCallbackErrorCode =
  | "missing_params"
  | "invalid_state"
  | "exchange_failed"
  | "save_failed";

function buildOAuthCookieName(
  providerKey: CloudProvider,
  field: "state" | "user"
) {
  return `${providerKey}_oauth_${field}`;
}

function buildOAuthRedirectTarget() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const studentManagementPath = resolveAppHrefForBasePath(
    DEFAULT_COUNSELING_SERVICE_HREF,
    "/counseling-service/student-management"
  );

  return new URL(studentManagementPath, baseUrl).toString();
}

export async function handleOAuthStartRoute({
  userId,
  providerKey,
  getOAuthUrl,
  failureMessage,
}: HandleOAuthStartRouteParams) {
  try {
    const state = randomUUID();
    const redirectUrl = await getOAuthUrl(state);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(buildOAuthCookieName(providerKey, "state"), state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    response.cookies.set(buildOAuthCookieName(providerKey, "user"), userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError(failureMessage, 500);
  }
}

export function createOAuthCallbackErrorResponse(
  providerKey: CloudProvider,
  errorCode: OAuthCallbackErrorCode
) {
  return NextResponse.redirect(
    `${buildOAuthRedirectTarget()}?${providerKey}_error=${errorCode}`
  );
}

export function createOAuthCallbackSuccessResponse(providerKey: CloudProvider) {
  const response = NextResponse.redirect(
    `${buildOAuthRedirectTarget()}?${providerKey}_connected=true`
  );
  response.cookies.delete(buildOAuthCookieName(providerKey, "state"));
  response.cookies.delete(buildOAuthCookieName(providerKey, "user"));
  return response;
}

// 보안 계약: 이 함수가 반환한 userId는 OAuth start 시 인증된 사용자의 ID다.
// state==savedState 검증으로 CSRF를 완화하지만, state는 세션과 HMAC으로 바인딩되지 않는다.
// 따라서 호출자는 반환된 userId를 신뢰하기 전에 현재 로그인 세션의 사용자와 일치하는지 별도로 확인해야 한다.
// (보안 강화 시 state에 세션 토큰 해시를 포함하고 콜백에서 재검증하는 방식을 권장)
export function resolveOAuthCallbackContext({
  request,
  providerKey,
}: ResolveOAuthCallbackContextParams):
  | { code: string; userId: string }
  | { response: Response } {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get(
    buildOAuthCookieName(providerKey, "state")
  )?.value;
  const userId = request.cookies.get(
    buildOAuthCookieName(providerKey, "user")
  )?.value;

  if (!code || !state || !savedState || !userId) {
    return {
      response: createOAuthCallbackErrorResponse(providerKey, "missing_params"),
    };
  }

  if (state !== savedState) {
    return {
      response: createOAuthCallbackErrorResponse(providerKey, "invalid_state"),
    };
  }

  return { code, userId };
}

async function parseJsonBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>,
  invalidDataMessage: string
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400),
    };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError(invalidDataMessage, 400),
    };
  }

  return {
    ok: true,
    data: parsed.data,
  };
}

export async function handleImportCommitRoute({
  request,
  userId,
}: HandleImportCommitRouteParams) {
  const parsed = await parseJsonBody(
    request,
    importRequestSchema,
    "요청 데이터가 올바르지 않습니다."
  );

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const result = await runImportCommitInSpring(userId, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ImportCommitSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스페이스/수강생 생성에 실패했습니다.", 500);
  }
}

export async function handleProviderStatusRoute<
  T extends Record<string, unknown>,
>({ userId, getPayload, failureMessage }: HandleProviderStatusRouteParams<T>) {
  try {
    const payload = await getPayload(userId);
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError(failureMessage, 500);
  }
}

export async function handleProviderFilesRoute<TFile>({
  request,
  userId,
  getAccessToken,
  listFiles,
  disconnectedMessage,
  failureMessage,
}: HandleProviderFilesRouteParams<TFile>) {
  try {
    const accessToken = await getAccessToken(userId);

    if (!accessToken) {
      return jsonError(disconnectedMessage, 401);
    }

    const folderId = request.nextUrl.searchParams.get("folderId") ?? undefined;
    const files = await listFiles(accessToken, folderId);

    return NextResponse.json({ files });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError(failureMessage, 500);
  }
}

export async function handleProviderFileProxyRoute({
  userId,
  fileId,
  mimeType,
  getAccessToken,
  downloadFile,
  disconnectedMessage,
  logLabel,
  resolveContentType,
}: HandleProviderFileProxyRouteParams) {
  try {
    const accessToken = await getAccessToken(userId);

    if (!accessToken) {
      return jsonError(disconnectedMessage, 401);
    }

    const buffer = await downloadFile(accessToken, fileId, mimeType);
    const contentType =
      (resolveContentType?.(mimeType) ?? mimeType) ||
      "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(`${logLabel} 파일 프록시 오류:`, error);
    return jsonError("파일을 가져오지 못했습니다.", 500);
  }
}

function appendOptionalAnalyzeFields(
  formData: FormData,
  body: CloudAnalyzeRequest
) {
  const instruction = body.instruction?.trim();
  if (instruction) {
    formData.set("instruction", instruction);
  }
  if (body.previousResult !== undefined) {
    formData.set(
      "previousResult",
      typeof body.previousResult === "string"
        ? body.previousResult
        : JSON.stringify(body.previousResult)
    );
  }
  if (body.spaceId?.trim()) {
    formData.set("spaceId", body.spaceId.trim());
  }
}

function buildCloudAnalyzeFile(
  fileName: string,
  mimeType: string,
  buffer: Buffer
) {
  return new Blob([new Uint8Array(buffer)], {
    type: mimeType || "application/octet-stream",
  });
}

export async function handleCloudAnalyzeRoute({
  request,
  userId,
  providerLabel,
  getAccessToken,
  downloadFile,
  requireMimeType,
}: HandleCloudAnalyzeRouteParams) {
  const parsed = await parseJsonBody(
    request,
    cloudAnalyzeRequestSchema,
    "draftId 또는 fileId가 필요합니다."
  );

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const formData = new FormData();
    appendOptionalAnalyzeFields(formData, parsed.data);

    if (parsed.data.draftId) {
      formData.set("draftId", parsed.data.draftId);
    } else {
      const requestedFileId = parsed.data.fileId;
      const requestedFileName = parsed.data.fileName;
      const requestedMimeType = parsed.data.mimeType ?? "";
      const hasRequiredFields = requireMimeType
        ? Boolean(requestedFileId && requestedFileName && requestedMimeType)
        : Boolean(requestedFileId && requestedFileName);

      if (!hasRequiredFields) {
        return jsonError(
          requireMimeType
            ? "fileId, fileName, mimeType이 필요합니다."
            : "fileId와 fileName이 필요합니다.",
          400
        );
      }

      const accessToken = await getAccessToken(userId);

      if (!accessToken) {
        return jsonError(`${providerLabel}가 연결되어 있지 않습니다.`, 401);
      }

      const fileName = requestedFileName ?? "cloud-import";
      const mimeType = requestedMimeType;
      const buffer = await downloadFile(
        accessToken,
        requestedFileId ?? "",
        mimeType
      );
      formData.set(
        "file",
        buildCloudAnalyzeFile(fileName, mimeType, buffer),
        fileName
      );
    }

    return await runLocalImportAnalyzeInSpring({
      userId,
      formData,
      accept: request.headers.get("accept"),
    });
  } catch (error) {
    if (error instanceof LocalImportAnalysisSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("파일 분석에 실패했습니다.", 500);
  }
}
