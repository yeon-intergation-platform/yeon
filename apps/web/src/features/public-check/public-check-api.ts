import type {
  PublicCheckEntry,
  PublicCheckMethod,
  PublicCheckSessionPublic,
  StudentAssignmentStatus,
  SubmitPublicCheckResult,
  VerifyPublicCheckIdentityResult,
} from "@yeon/api-contract";

type PublicCheckErrorPayload = { message?: string };

type VerifyPublicCheckParams = {
  token: string;
  name: string;
  phoneLast4: string;
};

type SubmitPublicCheckParams = {
  token: string;
  method: PublicCheckMethod;
  name: string;
  phoneLast4: string;
  needsIdentityVerification: boolean;
  assignmentStatus: StudentAssignmentStatus;
  assignmentLink: string;
  checkMode: PublicCheckSessionPublic["checkMode"] | undefined;
  latitude: number | null;
  longitude: number | null;
};

async function readJsonPayload<TPayload>(response: Response) {
  return (await response.json().catch(() => null)) as
    | (PublicCheckErrorPayload & Partial<TPayload>)
    | null;
}

function createPublicCheckError(
  payload: PublicCheckErrorPayload | null | undefined,
  fallbackMessage: string
) {
  return new Error(payload?.message || fallbackMessage);
}

export async function loadPublicCheckSession({
  token,
  entryMode,
}: {
  token: string;
  entryMode: PublicCheckEntry;
}) {
  const response = await fetch(
    `/api/v1/public-check-sessions/${token}?entry=${entryMode}`
  );
  const payload = await readJsonPayload<PublicCheckSessionPublic>(response);

  if (!response.ok) {
    throw createPublicCheckError(payload, "체크인 세션을 불러오지 못했습니다.");
  }

  return payload as PublicCheckSessionPublic;
}

export async function verifyPublicCheckIdentity({
  token,
  name,
  phoneLast4,
}: VerifyPublicCheckParams) {
  const response = await fetch(
    `/api/v1/public-check-sessions/${token}/verify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phoneLast4,
      }),
    }
  );
  const payload =
    await readJsonPayload<VerifyPublicCheckIdentityResult>(response);

  if (!response.ok) {
    throw createPublicCheckError(payload, "본인 확인을 처리하지 못했습니다.");
  }

  return payload as VerifyPublicCheckIdentityResult;
}

export async function submitPublicCheck({
  token,
  method,
  name,
  phoneLast4,
  needsIdentityVerification,
  assignmentStatus,
  assignmentLink,
  checkMode,
  latitude,
  longitude,
}: SubmitPublicCheckParams) {
  const response = await fetch(
    `/api/v1/public-check-sessions/${token}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method,
        name: needsIdentityVerification ? name.trim() || null : null,
        phoneLast4: needsIdentityVerification ? phoneLast4 || null : null,
        assignmentStatus:
          checkMode === "attendance_only" ? undefined : assignmentStatus,
        assignmentLink:
          checkMode === "attendance_only"
            ? undefined
            : assignmentLink.trim() || null,
        latitude,
        longitude,
      }),
    }
  );
  const payload = await readJsonPayload<SubmitPublicCheckResult>(response);

  if (!response.ok) {
    throw createPublicCheckError(payload, "체크인을 처리하지 못했습니다.");
  }

  return payload as SubmitPublicCheckResult;
}
