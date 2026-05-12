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

const CARD_HOME_CTA_ITEMS = [
  {
    href: "/card-service/rooms",
    title: "카드방 입장",
    description: "친구와 역할을 나눠 채팅으로 암기 답변을 검증해요.",
    target: "rooms",
    primary: true,
  },
  {
    href: "/card-service/decks",
    title: "내 덱 보기",
    description: "기존 덱을 열어 카드를 추가하거나 혼자 복습해요.",
    target: "decks",
    primary: false,
  },
] as const;

export function CardServiceHome() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const { profile, updateProfile, loaded } = useTypingProfile();
  const { settings } = useTypingSettings();

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

      <main className="flex flex-col items-center px-5 py-5 md:px-10 md:py-5">
        <section className="w-full max-w-[980px]">
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

        <section className="mt-8 grid w-full max-w-[980px] overflow-hidden rounded-[28px] border border-[#e5e5e5] bg-white md:grid-cols-[430px_minmax(0,1fr)]">
          <div className="border-b border-[#e5e5e5] p-5 md:border-b-0 md:border-r md:p-6">
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

          <div className="p-5 md:p-6">
            <h2 className="text-[16px] font-bold text-[#111]">오늘의 시작</h2>
            <div className="mt-5 grid gap-4">
              {CARD_HOME_CTA_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl border px-5 py-5 no-underline transition-colors ${
                    item.primary
                      ? "border-[#111] bg-[#111] text-white hover:bg-[#333]"
                      : "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
                  }`}
                  onClick={() => trackHomeClick(item.target)}
                >
                  <span className="block text-[16px] font-bold">
                    {item.title}
                  </span>
                  <span
                    className={`mt-1 block text-[13px] leading-[1.6] ${
                      item.primary ? "text-white/70" : "text-[#777]"
                    }`}
                  >
                    {item.description}
                  </span>
                </Link>
              ))}
              <button
                type="button"
                onClick={openCreate}
                className="block rounded-2xl border border-[#e5e5e5] bg-white px-5 py-5 text-left text-[#111] transition-colors hover:border-[#111]"
              >
                <span className="block text-[16px] font-bold">
                  새 덱 만들기
                </span>
                <span className="mt-1 block text-[13px] leading-[1.6] text-[#777]">
                  카드방에서 사용할 앞면/뒷면 덱을 먼저 준비해요.
                </span>
              </button>
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
