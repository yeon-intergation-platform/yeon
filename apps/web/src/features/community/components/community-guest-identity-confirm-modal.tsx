"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  YeonButton,
  YeonField,
  YeonModal,
  YeonSurface,
  YeonText,
  YeonLabel,
  YeonView,
  YEON_WEB_OVERLAY_CLASS,
  YEON_WEB_SHADOW_CLASS,
} from "@yeon/ui";
import { useEffect, useState } from "react";
import { type CommunityGuestIdentity } from "../community-guest-identity-confirm";

type CommunityGuestIdentityConfirmModalProps = CommunityGuestIdentity & {
  isOpen: boolean;
  actionLabel: string;
  onClose: () => void;
  onConfirm: (identity: CommunityGuestIdentity) => void;
};

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

  useEffect(() => {
    if (!isOpen) return;
    setNicknameDraft(guestNickname);
    setPasswordDraft(guestPassword);
  }, [guestNickname, guestPassword, isOpen]);

  if (!isOpen) return null;

  const trimmedNickname = nicknameDraft.trim();
  const trimmedPassword = passwordDraft.trim();
  const canConfirm = Boolean(trimmedNickname && trimmedPassword);

  return (
    <YeonModal
      visible
      onRequestClose={onClose}
      aria-labelledby="community-guest-identity-confirm-title"
      className={`fixed inset-0 z-50 m-0 flex h-auto max-h-none w-auto max-w-none items-center justify-center border-0 p-0 ${YEON_WEB_OVERLAY_CLASS.scrimMedium}`}
    >
      <YeonSurface
        as="form"
        className={`mx-4 w-full max-w-[420px] p-5 ${YEON_WEB_SHADOW_CLASS.modal}`}
        onSubmit={(event) => {
          event.preventDefault();
          if (!canConfirm) return;
          onConfirm({
            guestNickname: trimmedNickname,
            guestPassword: trimmedPassword,
          });
        }}
      >
        <YeonText
          as="h2"
          id="community-guest-identity-confirm-title"
          variant="subtitle"
          className="text-[18px]"
        >
          작성자 확인
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-2 leading-[1.7]`}
        >
          {actionLabel}하려면 커뮤니티에서 사용할 닉네임과 비밀번호를 입력해
          주세요. 기존 글/댓글 수정·삭제 때는 작성 시 사용한 값과 같아야 합니다.
        </YeonText>

        <YeonView className="mt-4 grid gap-3">
          <YeonLabel className={SHARED_FEATURE_CLASS.text12EmphasisMuted}>
            닉네임
            <YeonField
              value={nicknameDraft}
              onChange={(event) => setNicknameDraft(event.target.value)}
              placeholder="닉네임 입력"
              maxLength={40}
              className="mt-1 h-10 text-[13px] font-normal"
            />
          </YeonLabel>
          <YeonLabel className={SHARED_FEATURE_CLASS.text12EmphasisMuted}>
            비밀번호
            <YeonField
              value={passwordDraft}
              onChange={(event) => setPasswordDraft(event.target.value)}
              placeholder="작성 시 사용한 비밀번호"
              type="password"
              maxLength={128}
              className="mt-1 h-10 text-[13px] font-normal"
            />
          </YeonLabel>
        </YeonView>

        <YeonView className="mt-5 flex justify-end gap-2">
          <YeonButton type="button" size="sm" onClick={onClose}>
            취소
          </YeonButton>
          <YeonButton
            type="submit"
            size="sm"
            variant="primary"
            disabled={!canConfirm}
          >
            확인
          </YeonButton>
        </YeonView>
      </YeonSurface>
    </YeonModal>
  );
}
