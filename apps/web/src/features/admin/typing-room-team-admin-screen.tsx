"use client";
import { useState } from "react";
import {
  YeonButton,
  YeonField,
  YeonForm,
  YeonLabel,
  YeonOption,
  YeonText,
  YeonView,
  type YeonFormElement,
  type YeonFormEvent,
} from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  ADMIN_TEAM_TARGET,
  seedTypingRoomTeamParticipants,
  type AdminTeamTarget,
  type TypingRoomTeamParticipantsSeedResult,
} from "./typing-room-team-admin-fetch";

const TEAM_OPTIONS: { label: string; value: AdminTeamTarget }[] = [
  { label: "자동 균형", value: ADMIN_TEAM_TARGET.BALANCED },
  { label: "1팀", value: ADMIN_TEAM_TARGET.RED },
  { label: "파랑팀", value: ADMIN_TEAM_TARGET.BLUE },
];

export function TypingRoomTeamAdminScreen({
  adminEmail,
}: {
  adminEmail: string;
}) {
  const [roomId, setRoomId] = useState("");
  const [count, setCount] = useState(1);
  const [team, setTeam] = useState<AdminTeamTarget>(ADMIN_TEAM_TARGET.BALANCED);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] =
    useState<TypingRoomTeamParticipantsSeedResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();
    const trimmedRoomId = roomId.trim();
    if (!trimmedRoomId) {
      setMessage("타자방 ID를 입력해 주세요.");
      setResult(null);
      return;
    }

    setIsSubmitting(true);
    setMessage("연습 참가자를 추가하는 중입니다.");
    setResult(null);

    try {
      const nextResult = await seedTypingRoomTeamParticipants({
        roomId: trimmedRoomId,
        count,
        team,
      });
      setResult(nextResult);
      setMessage(nextResult.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "연습 참가자 추가에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <YeonView
      as="main"
      className="min-h-screen bg-[#fafafa] px-6 py-10 text-[#111]"
    >
      <YeonView className="mx-auto grid max-w-4xl gap-6">
        <YeonView>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[13px] font-black uppercase tracking-[0.24em] text-[#666]"
          >
            Typing Room Admin
          </YeonText>
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className="mt-3 text-[34px] font-black tracking-[-0.04em]"
          >
            점령전 대기실 연습 참가자 추가
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-3 max-w-2xl text-[15px] leading-7 text-[#666]"
          >
            로그인 계정을 만들지 않고 race-server 안의 대기실 참가자 상태만
            채웁니다. 점령전 방, 대기 중인 방, 빈 자리가 있는 방에만 동작합니다.
          </YeonText>
        </YeonView>

        <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
          >
            관리자
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-2 text-[18px] font-black"
          >
            {adminEmail}
          </YeonText>
        </YeonView>

        <YeonForm
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-2xl border border-[#e5e5e5] bg-white p-6"
        >
          <YeonLabel className="grid gap-2 text-[14px] font-black text-[#111]">
            타자방 ID
            <YeonField
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              placeholder="예: y6q4mY2..."
              disabled={isSubmitting}
              className="h-12 rounded-lg px-4 text-[14px]"
            />
          </YeonLabel>

          <YeonView className="grid gap-4 sm:grid-cols-2">
            <YeonLabel className="grid gap-2 text-[14px] font-black text-[#111]">
              추가 인원
              <YeonField
                as="select"
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                disabled={isSubmitting}
                className="h-12 rounded-lg px-4 text-[14px]"
              >
                {[1, 2, 3, 4].map((value) => (
                  <YeonOption key={value} value={value}>
                    {value}명
                  </YeonOption>
                ))}
              </YeonField>
            </YeonLabel>

            <YeonLabel className="grid gap-2 text-[14px] font-black text-[#111]">
              팀
              <YeonField
                as="select"
                value={team}
                onChange={(event) =>
                  setTeam(event.target.value as AdminTeamTarget)
                }
                disabled={isSubmitting}
                className="h-12 rounded-lg px-4 text-[14px]"
              >
                {TEAM_OPTIONS.map((option) => (
                  <YeonOption key={option.value} value={option.value}>
                    {option.label}
                  </YeonOption>
                ))}
              </YeonField>
            </YeonLabel>
          </YeonView>

          <YeonButton
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="h-12 w-fit rounded-lg px-5 text-[14px] font-black"
          >
            {isSubmitting ? "추가 중" : "연습 참가자 추가"}
          </YeonButton>

          {message && (
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-[13px] font-semibold text-[#111]"
            >
              {message}
            </YeonText>
          )}

          {result?.snapshot && (
            <YeonView className="grid gap-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 text-[13px] font-semibold text-[#111]">
              <YeonText variant="unstyled" tone="inherit">
                방: {result.snapshot.title} ({result.snapshot.roomCode})
              </YeonText>
              <YeonText variant="unstyled" tone="inherit">
                인원: {result.snapshot.currentParticipants}/
                {result.snapshot.maxParticipants}
              </YeonText>
              <YeonText variant="unstyled" tone="inherit">
                추가됨: {result.insertedCount}명
              </YeonText>
            </YeonView>
          )}
        </YeonForm>
      </YeonView>
    </YeonView>
  );
}
