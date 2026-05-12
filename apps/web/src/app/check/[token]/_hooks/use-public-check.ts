"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  PublicCheckEntry,
  PublicCheckMethod,
  PublicCheckSessionPublic,
  StudentAssignmentStatus,
  SubmitPublicCheckResult,
  VerifyPublicCheckIdentityResult,
} from "@yeon/api-contract";

export type PublicCheckFeedback = {
  message: string;
  matchedMemberName: string | null;
  tone: "error" | "success";
};

type PublicCheckErrorPayload = { message?: string };

export function buildPublicCheckFeedback(params: {
  message: string;
  matchedMemberName: string | null;
  tone: "error" | "success";
}): PublicCheckFeedback {
  return {
    message: params.message,
    matchedMemberName: params.matchedMemberName,
    tone: params.tone,
  };
}

function publicCheckSessionQueryKey(
  token: string | null,
  entryMode: PublicCheckEntry
) {
  return ["public-check-session", token, entryMode] as const;
}

async function readJsonPayload<TPayload>(response: Response) {
  return (await response.json().catch(() => null)) as
    | (PublicCheckErrorPayload & Partial<TPayload>)
    | null;
}

export function usePublicCheckSession({
  token,
  entryMode,
}: {
  token: string | null;
  entryMode: PublicCheckEntry;
}) {
  return useQuery({
    queryKey: publicCheckSessionQueryKey(token, entryMode),
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/public-check-sessions/${token}?entry=${entryMode}`
      );
      const payload = await readJsonPayload<PublicCheckSessionPublic>(response);

      if (!response.ok) {
        throw new Error(
          payload?.message || "체크인 세션을 불러오지 못했습니다."
        );
      }

      return payload as PublicCheckSessionPublic;
    },
  });
}

export function useVerifyPublicCheck({
  token,
  name,
  phoneLast4,
  onFeedback,
  onVerified,
}: {
  token: string | null;
  name: string;
  phoneLast4: string;
  onFeedback: (feedback: PublicCheckFeedback | null) => void;
  onVerified: () => Promise<unknown>;
}) {
  return useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("체크인 세션을 찾지 못했습니다.");
      }

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
        throw new Error(payload?.message || "본인 확인을 처리하지 못했습니다.");
      }

      return payload as VerifyPublicCheckIdentityResult;
    },
    onMutate: () => {
      onFeedback(null);
    },
    onSuccess: async (payload) => {
      if (payload.verificationStatus !== "matched") {
        onFeedback(
          buildPublicCheckFeedback({
            message: payload.message,
            matchedMemberName: payload.matchedMemberName,
            tone: "error",
          })
        );
        return;
      }

      onFeedback(
        buildPublicCheckFeedback({
          message: payload.message,
          matchedMemberName: payload.matchedMemberName,
          tone: "success",
        })
      );
      await onVerified();
    },
    onError: (error) => {
      onFeedback(
        buildPublicCheckFeedback({
          message:
            error instanceof Error
              ? error.message
              : "본인 확인을 처리하지 못했습니다.",
          matchedMemberName: null,
          tone: "error",
        })
      );
    },
  });
}

async function resolveLocationIfNeeded(currentMethod: PublicCheckMethod) {
  if (currentMethod !== "location") {
    return { latitude: null, longitude: null };
  }

  return new Promise<{ latitude: number; longitude: number }>(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("이 브라우저는 위치 정보를 지원하지 않습니다."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () =>
          reject(
            new Error("위치 권한을 허용해야 위치 기반 체크인이 가능합니다.")
          ),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  );
}

export function useSubmitPublicCheck({
  token,
  method,
  name,
  phoneLast4,
  needsIdentityVerification,
  assignmentStatus,
  assignmentLink,
  checkMode,
  onFeedback,
}: {
  token: string | null;
  method: PublicCheckMethod;
  name: string;
  phoneLast4: string;
  needsIdentityVerification: boolean;
  assignmentStatus: StudentAssignmentStatus;
  assignmentLink: string;
  checkMode: PublicCheckSessionPublic["checkMode"] | undefined;
  onFeedback: (feedback: PublicCheckFeedback | null) => void;
}) {
  return useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("체크인 세션을 찾지 못했습니다.");
      }

      const location = await resolveLocationIfNeeded(method);
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
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        }
      );
      const payload = await readJsonPayload<SubmitPublicCheckResult>(response);

      if (!response.ok) {
        throw new Error(payload?.message || "체크인을 처리하지 못했습니다.");
      }

      return payload as SubmitPublicCheckResult;
    },
    onMutate: () => {
      onFeedback(null);
    },
    onSuccess: (payload) => {
      onFeedback(
        buildPublicCheckFeedback({
          message: payload.message,
          matchedMemberName: payload.matchedMemberName,
          tone: payload.verificationStatus === "matched" ? "success" : "error",
        })
      );
    },
    onError: (error) => {
      onFeedback(
        buildPublicCheckFeedback({
          message:
            error instanceof Error
              ? error.message
              : "체크인을 처리하지 못했습니다.",
          matchedMemberName: null,
          tone: "error",
        })
      );
    },
  });
}
