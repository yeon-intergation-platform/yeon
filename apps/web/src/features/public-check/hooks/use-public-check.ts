"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  PublicCheckEntry,
  PublicCheckMethod,
  PublicCheckSessionPublic,
  StudentAssignmentStatus,
} from "@yeon/api-contract";
import {
  loadPublicCheckSession,
  submitPublicCheck,
  verifyPublicCheckIdentity,
} from "../public-check-api";
import { publicCheckQueryKeys } from "../public-check-query-keys";

export type PublicCheckFeedback = {
  message: string;
  matchedMemberName: string | null;
  tone: "error" | "success";
};

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

export function usePublicCheckSession({
  token,
  entryMode,
}: {
  token: string | null;
  entryMode: PublicCheckEntry;
}) {
  return useQuery({
    queryKey: publicCheckQueryKeys.session(token, entryMode),
    enabled: !!token,
    queryFn: async () => {
      if (!token) {
        throw new Error("체크인 세션을 찾지 못했습니다.");
      }

      return loadPublicCheckSession({ token, entryMode });
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

      return verifyPublicCheckIdentity({
        token,
        name,
        phoneLast4,
      });
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
      return submitPublicCheck({
        token,
        method,
        name,
        phoneLast4,
        needsIdentityVerification,
        assignmentStatus,
        assignmentLink,
        checkMode,
        latitude: location.latitude,
        longitude: location.longitude,
      });
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
