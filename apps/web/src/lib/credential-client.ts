import type {
  CredentialLoginBody,
  CredentialLoginResponse,
  CredentialRegisterBody,
  CredentialRegisterResponse,
  CredentialResendVerificationBody,
  CredentialResetConfirmBody,
  CredentialResetRequestBody,
  CredentialSetPasswordBody,
} from "@yeon/api-contract/credential";
import {
  errorResponseSchema,
  type ErrorResponseMeta,
} from "@yeon/api-contract/error";
import {
  fetchYeon,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { getAuthErrorCopy, isAuthErrorCode } from "@/server/auth/auth-errors";

const CREDENTIAL_FALLBACK_MESSAGE =
  "요청 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.";

export class CredentialApiError extends Error {
  /** 백엔드 분기용 고정 식별자(예: ACCOUNT_LOCKED). 없을 수 있다. */
  public readonly code?: string;
  /** code + 상황별 확장 메타데이터. */
  public readonly detail?: ErrorResponseMeta;

  constructor(
    public readonly status: number,
    message: string,
    detail?: ErrorResponseMeta
  ) {
    super(message);
    this.name = "CredentialApiError";
    this.code = detail?.code;
    this.detail = detail;
  }
}

export function getCredentialErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (!(error instanceof CredentialApiError)) {
    return fallbackMessage;
  }

  // code가 있으면 code별로 완비된 안내 카피를 우선 사용한다(문구 일관성).
  if (isAuthErrorCode(error.code)) {
    return getAuthErrorCopy(error.code).description;
  }

  return error.message;
}

async function extractError(response: YeonResponse): Promise<{
  message: string;
  detail: ErrorResponseMeta;
}> {
  try {
    const json = await response.json();
    const parsed = errorResponseSchema.safeParse(json);
    if (parsed.success) {
      const { message, ...detail } = parsed.data;
      return {
        message: message.length > 0 ? message : CREDENTIAL_FALLBACK_MESSAGE,
        detail,
      };
    }
  } catch {
    // noop
  }
  return { message: CREDENTIAL_FALLBACK_MESSAGE, detail: {} };
}

async function postJson<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const response = await fetchYeon(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const { message, detail } = await extractError(response);
    throw new CredentialApiError(response.status, message, detail);
  }

  return (await response.json()) as TRes;
}

async function postNoContent<TReq>(path: string, body: TReq): Promise<void> {
  const response = await fetchYeon(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const { message, detail } = await extractError(response);
    throw new CredentialApiError(response.status, message, detail);
  }
}

export function credentialRegister(body: CredentialRegisterBody) {
  return postJson<CredentialRegisterBody, CredentialRegisterResponse>(
    "/api/auth/credentials/register",
    body
  );
}

export function credentialLogin(body: CredentialLoginBody) {
  return postJson<CredentialLoginBody, CredentialLoginResponse>(
    "/api/auth/credentials/login",
    body
  );
}

export function credentialRequestReset(body: CredentialResetRequestBody) {
  return postNoContent<CredentialResetRequestBody>(
    "/api/auth/credentials/reset-request",
    body
  );
}

export function credentialConfirmReset(body: CredentialResetConfirmBody) {
  return postNoContent<CredentialResetConfirmBody>(
    "/api/auth/credentials/reset-confirm",
    body
  );
}

export function credentialResendVerification(
  body: CredentialResendVerificationBody
) {
  return postNoContent<CredentialResendVerificationBody>(
    "/api/auth/credentials/resend-verification",
    body
  );
}

export function credentialSetPassword(body: CredentialSetPasswordBody) {
  return postNoContent<CredentialSetPasswordBody>(
    "/api/auth/credentials/set-password",
    body
  );
}
