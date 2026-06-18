"use client";

import { useEffect, useMemo, useState } from "react";
import {
  YeonButton,
  YeonField,
  YeonIcon,
  YeonLabel,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import {
  hasCompleteCommunityGuestIdentity,
  type CommunityGuestIdentity,
} from "../community-guest-identity-confirm";

type CommunityGuestIdentityCardProps = CommunityGuestIdentity & {
  onSaveIdentity: (identity: CommunityGuestIdentity) => void;
};

export function CommunityGuestIdentityCard({
  guestNickname,
  guestPassword,
  onSaveIdentity,
}: CommunityGuestIdentityCardProps) {
  const [nicknameDraft, setNicknameDraft] = useState(guestNickname);
  const [passwordDraft, setPasswordDraft] = useState(guestPassword);

  useEffect(() => {
    setNicknameDraft(guestNickname);
    setPasswordDraft(guestPassword);
  }, [guestNickname, guestPassword]);

  const savedIdentity = useMemo(
    () => ({ guestNickname, guestPassword }),
    [guestNickname, guestPassword]
  );
  const draftIdentity = useMemo(
    () => ({
      guestNickname: nicknameDraft,
      guestPassword: passwordDraft,
    }),
    [nicknameDraft, passwordDraft]
  );
  const isRegistered = hasCompleteCommunityGuestIdentity(savedIdentity);
  const canSave = hasCompleteCommunityGuestIdentity(draftIdentity);

  return (
    <YeonSurface
      as="form"
      className="rounded-2xl border border-[#e5e5e5] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSave) return;
        onSaveIdentity({
          guestNickname: nicknameDraft.trim(),
          guestPassword: passwordDraft.trim(),
        });
      }}
    >
      <YeonView className="flex items-center justify-between gap-3">
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className="text-[15px] font-black tracking-[-0.02em] text-[#111]"
        >
          게스트 인증
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={[
            "rounded-full border px-2 py-1 text-[11px] font-bold",
            isRegistered
              ? "border-[#111] bg-[#111] text-white"
              : "border-[#e5e5e5] text-[#777]",
          ].join(" ")}
        >
          {isRegistered ? "등록됨" : "미등록"}
        </YeonText>
      </YeonView>

      <YeonView className="mt-3 grid gap-3">
        <YeonLabel className="text-[12px] font-semibold text-[#666]">
          닉네임
          <YeonField
            value={nicknameDraft}
            onChange={(event) => setNicknameDraft(event.target.value)}
            placeholder="닉네임 입력"
            maxLength={40}
            className="mt-1 h-10"
          />
        </YeonLabel>
        <YeonLabel className="text-[12px] font-semibold text-[#666]">
          비밀번호
          <YeonField
            value={passwordDraft}
            onChange={(event) => setPasswordDraft(event.target.value)}
            placeholder="수정/삭제용 비밀번호"
            type="password"
            maxLength={128}
            className="mt-1 h-10"
          />
        </YeonLabel>
      </YeonView>

      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="mt-3 text-[12px] leading-[1.55] text-[#777]"
      >
        등록하면 글과 댓글 작성·수정·삭제에 자동으로 사용돼요.
      </YeonText>

      <YeonButton
        type="submit"
        variant="primary"
        disabled={!canSave}
        className="mt-4 h-10 w-full gap-2 text-[13px] font-bold"
      >
        <YeonIcon name="user" size={15} />
        등록
      </YeonButton>
    </YeonSurface>
  );
}
