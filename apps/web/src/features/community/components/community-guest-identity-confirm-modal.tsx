"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

import { useEffect, useState } from "react";

export const COMMUNITY_GUEST_IDENTITY_CONFIRM_DISMISSED_KEY =
  "yeon-community-guest-identity-confirm-dismissed";

export type CommunityGuestIdentity = {
  guestNickname: string;
  guestPassword: string;
};

type CommunityGuestIdentityConfirmModalProps = CommunityGuestIdentity & {
  isOpen: boolean;
  actionLabel: string;
  onClose: () => void;
  onConfirm: (
    identity: CommunityGuestIdentity,
    options: { dismiss: boolean }
  ) => void;
};

export function isCommunityGuestIdentityConfirmDismissed() {
  if (typeof window === "undefined") return false;
  return (
    window.localStorage.getItem(
      COMMUNITY_GUEST_IDENTITY_CONFIRM_DISMISSED_KEY
    ) === "true"
  );
}

export function persistCommunityGuestIdentityConfirmDismissed() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    COMMUNITY_GUEST_IDENTITY_CONFIRM_DISMISSED_KEY,
    "true"
  );
}

export function CommunityGuestIdentityConfirmModal(
  props: CommunityGuestIdentityConfirmModalProps
) {
  const {
    isOpen,
    actionLabel,
    guestNickname,
    guestPassword,
    onClose,
    onConfirm,
  } = props;
  const [nicknameDraft, setNicknameDraft] = useState(guestNickname);
  const [passwordDraft, setPasswordDraft] = useState(guestPassword);
  const [dismiss, setDismiss] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNicknameDraft(guestNickname);
    setPasswordDraft(guestPassword);
    setDismiss(false);
  }, [guestNickname, guestPassword, isOpen]);

  if (!isOpen) return null;

  const trimmedNickname = nicknameDraft.trim();
  const trimmedPassword = passwordDraft.trim();
  const canConfirm = Boolean(trimmedNickname && trimmedPassword);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-guest-identity-confirm-title"
    >
      <form
        className="w-full max-w-[420px] rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canConfirm) return;
          onConfirm(
            {
              guestNickname: trimmedNickname,
              guestPassword: trimmedPassword,
            },
            { dismiss }
          );
        }}
      >
        <h2
          id="community-guest-identity-confirm-title"
          className="text-[18px] font-black tracking-[-0.03em] text-[#111]"
        >
          작성자 확인
        </h2>
        <p
          className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-2 leading-[1.7]`}
        >
          {actionLabel}하려면 커뮤니티에서 사용할 닉네임과 비밀번호를 입력해
          주세요. 기존 글/댓글 수정·삭제 때는 작성 시 사용한 값과 같아야 합니다.
        </p>

        <div className="mt-4 grid gap-3">
          <label className={SHARED_FEATURE_CLASS.text12EmphasisMuted}>
            닉네임
            <input
              value={nicknameDraft}
              onChange={(event) => setNicknameDraft(event.target.value)}
              placeholder="닉네임 입력"
              maxLength={40}
              className="mt-1 h-10 w-full rounded-xl border border-[#ddd] px-3 text-[13px] font-normal text-[#111] outline-none focus:border-[#111]"
            />
          </label>
          <label className={SHARED_FEATURE_CLASS.text12EmphasisMuted}>
            비밀번호
            <input
              value={passwordDraft}
              onChange={(event) => setPasswordDraft(event.target.value)}
              placeholder="작성 시 사용한 비밀번호"
              type="password"
              maxLength={128}
              className="mt-1 h-10 w-full rounded-xl border border-[#ddd] px-3 text-[13px] font-normal text-[#111] outline-none focus:border-[#111]"
            />
          </label>
        </div>

        <label
          className={`mt-4 flex items-center gap-2 ${SHARED_FEATURE_CLASS.text12EmphasisMuted}`}
        >
          <input
            type="checkbox"
            checked={dismiss}
            onChange={(event) => setDismiss(event.target.checked)}
            className="h-4 w-4 accent-[#111]"
          />
          다시 보지 않음
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#ddd] px-4 py-2 text-[12px] font-semibold text-[#333]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!canConfirm}
            className="rounded-xl bg-[#111] px-4 py-2 text-[12px] font-semibold text-white disabled:bg-[#d0d0d0]"
          >
            확인
          </button>
        </div>
      </form>
    </div>
  );
}
