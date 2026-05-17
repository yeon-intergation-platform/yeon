"use client";

import Link from "next/link";
import { useState } from "react";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import {
  CommonProductHeader,
  ProductHeaderSettingsButton,
} from "@/components/product-shell/product-header";
import { TypingProfileCard } from "@/features/typing-service/typing-profile-card";
import { useTypingProfile } from "@/features/typing-service/use-typing-profile";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";

import { useIsAuthenticated } from "./auth-context";
import { CardServiceSettingsDialog, CreateDeckDialog } from "./components";
import { useDeckList } from "./hooks";

export function CardServiceHome() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const { profile, updateProfile, loaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const decksQuery = useDeckList();
  const hasDecks = (decksQuery.data?.length ?? 0) > 0;
  const isDeckStateLoading = decksQuery.isPending;
  const shouldShowDeckListAction = decksQuery.isError || hasDecks;

  const trackHomeClick = (target: string) => {
    trackEvent(analyticsEvents.cardDeckOpen, {
      source: "card_room_home",
      target,
      authenticated: isAuthenticated,
      has_profile: loaded,
      character_id: profile.characterId,
    });
  };

  const openCreate = () => {
    setCreateOpen(true);
    trackEvent(analyticsEvents.cardDeckCreateOpen, {
      source: "card_room_home",
      authenticated: isAuthenticated,
      character_id: profile.characterId,
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <CommonProductHeader
        activeService="card"
        settingsControl={
          <ProductHeaderSettingsButton
            onClick={() => setSettingsOpen(true)}
            aria-label="카드 설정"
          />
        }
      />

      <main className="flex min-w-0 flex-col items-center px-3 py-5 sm:px-5 md:px-10 md:py-5">
        <section className="w-full max-w-[980px] min-w-0">
          <div className="max-w-[680px]">
            <h1 className="text-[27px] font-black tracking-[-0.04em] text-[#111] md:text-[34px]">
              바로 시작하는 카드공부
            </h1>
            <p className="mt-3 text-[14px] leading-[1.75] text-[#666] md:text-[15px]">
              카드를 넘기기 전에 먼저 떠올리고, 친구와 함께 답을 확인해보세요.
              혼자 복습하거나 카드방에서 함께 공부할 수 있어요.
            </p>
          </div>
        </section>

        <section className="mt-8 grid w-full max-w-[980px] min-w-0 overflow-x-visible rounded-[20px] border border-[#e5e5e5] bg-white sm:rounded-[24px] md:grid-cols-[430px_minmax(0,1fr)] md:rounded-[28px]">
          <div className="min-w-0 border-b border-[#e5e5e5] p-4 md:border-b-0 md:border-r md:p-6">
            <h2 className="text-[16px] font-bold text-[#111]">내 프로필</h2>
            <div className="mt-5 flex justify-center">
              <TypingProfileCard
                profile={profile}
                onNicknameChange={(nickname) => updateProfile({ nickname })}
                onCharacterChange={(characterId) =>
                  updateProfile({ characterId })
                }
                locale={settings.locale}
              />
            </div>
          </div>

          <div className="min-w-0 p-4 md:p-6">
            <h2 className="text-[16px] font-bold text-[#111]">오늘의 시작</h2>
            <div className="mt-5 grid gap-4">
              <Link
                href="/card-service/rooms"
                className="block w-full rounded-2xl border border-[#111] bg-[#111] px-5 py-5 text-white no-underline transition-colors hover:bg-[#333]"
                onClick={() => trackHomeClick("rooms")}
              >
                <span className="block text-[16px] font-bold">카드방 입장</span>
                <span className="mt-1 block text-[13px] leading-[1.6] text-white/70">
                  친구와 역할을 나눠 채팅으로 암기 답변을 검증해요.
                </span>
              </Link>

              {isDeckStateLoading ? (
                <button
                  type="button"
                  disabled
                  className="block w-full cursor-wait rounded-2xl border border-[#e5e5e5] bg-[#f7f7f7] px-5 py-5 text-left text-[#777]"
                >
                  <span className="block text-[16px] font-bold">
                    덱 확인 중
                  </span>
                  <span className="mt-1 block text-[13px] leading-[1.6] text-[#999]">
                    저장된 덱이 있는지 확인하고 있어요.
                  </span>
                </button>
              ) : shouldShowDeckListAction ? (
                <Link
                  href="/card-service/decks"
                  className="block w-full rounded-2xl border border-[#e5e5e5] bg-white px-5 py-5 text-[#111] no-underline transition-colors hover:border-[#111]"
                  onClick={() => trackHomeClick("decks")}
                >
                  <span className="block text-[16px] font-bold">
                    내 덱 보기
                  </span>
                  <span className="mt-1 block text-[13px] leading-[1.6] text-[#777]">
                    {decksQuery.isError
                      ? "덱 목록에서 저장된 카드를 다시 확인해요."
                      : "기존 덱을 열어 카드를 추가하거나 혼자 복습해요."}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={openCreate}
                  className="block w-full rounded-2xl border border-[#e5e5e5] bg-white px-5 py-5 text-left text-[#111] transition-colors hover:border-[#111]"
                >
                  <span className="block text-[16px] font-bold">
                    새 덱 만들기
                  </span>
                  <span className="mt-1 block text-[13px] leading-[1.6] text-[#777]">
                    카드방에서 사용할 앞면/뒷면 덱을 먼저 준비해요.
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {isCreateOpen ? (
        <CreateDeckDialog onClose={() => setCreateOpen(false)} />
      ) : null}

      {isSettingsOpen ? (
        <CardServiceSettingsDialog onClose={() => setSettingsOpen(false)} />
      ) : null}
    </div>
  );
}
