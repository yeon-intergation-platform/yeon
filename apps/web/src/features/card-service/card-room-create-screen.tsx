"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { CharacterSprite } from "@/features/typing-service/character-sprite";
import { findCharacter } from "@/features/typing-service/characters";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import { useTypingProfile } from "@/features/typing-service/use-typing-profile";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import { CARD_ROOM_SAMPLE_ROOMS } from "./card-room-fixtures";

export function CardRoomCreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("영단어 서로 확인하기");
  const [deckTitle, setDeckTitle] = useState("수능 기본 단어");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const { profile } = useTypingProfile();
  const { settings } = useTypingSettings();
  const frameOverrides = useCharacterFrameOverrides();
  const character = findCharacter(profile.characterId);

  const previewRoomId = useMemo(() => {
    const normalized = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-");
    return normalized || CARD_ROOM_SAMPLE_ROOMS[0].id;
  }, [title]);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <CommonProductHeader activeService="card" />
      <main className="mx-auto grid max-w-[1040px] gap-8 px-6 py-10 md:grid-cols-[360px_minmax(0,1fr)] md:px-10">
        <aside className="rounded-[28px] border border-[#e5e5e5] bg-[#fafafa] p-6">
          <h1 className="text-[28px] font-black tracking-[-0.04em] text-[#111]">
            카드방 만들기
          </h1>
          <p className="mt-3 text-[14px] leading-[1.7] text-[#666]">
            이번 차수는 서버 생성 없이 화면 골격만 확인합니다. 캐릭터와 방
            설정은 다음 학습 화면으로 전달되는 형태를 미리 보여줍니다.
          </p>
          <div className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-4">
            <p className="text-[13px] font-bold text-[#666]">입장 캐릭터</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-[88px] w-[88px] items-end justify-center overflow-hidden rounded-xl bg-[#f5f5f5]">
                <CharacterSprite
                  character={character}
                  maxHeight={82}
                  sequenceOverride={frameOverrides[character.id]}
                />
              </div>
              <div>
                <p className="text-[17px] font-bold text-[#111]">
                  {profile.nickname}
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[#777]">
                  {character.label[settings.locale]}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <form
          className="rounded-[28px] border border-[#e5e5e5] bg-white p-6"
          onSubmit={(event) => {
            event.preventDefault();
            const params = new URLSearchParams({
              title: title.trim() || "카드방",
              deckTitle: deckTitle.trim() || "샘플 덱",
              visibility,
            });
            router.push(
              `/card-service/rooms/${previewRoomId}?${params.toString()}`
            );
          }}
        >
          <h2 className="text-[18px] font-bold text-[#111]">방 설정</h2>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-[13px] font-semibold text-[#666]">
              방 제목
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={40}
                className="h-12 rounded-xl border border-[#d9d9d9] px-4 text-[15px] font-semibold text-[#111] outline-none focus:border-[#111]"
              />
            </label>
            <label className="grid gap-2 text-[13px] font-semibold text-[#666]">
              사용할 덱
              <input
                value={deckTitle}
                onChange={(event) => setDeckTitle(event.target.value)}
                maxLength={40}
                className="h-12 rounded-xl border border-[#d9d9d9] px-4 text-[15px] font-semibold text-[#111] outline-none focus:border-[#111]"
              />
            </label>
            <fieldset className="grid gap-2">
              <legend className="text-[13px] font-semibold text-[#666]">
                공개 여부
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["public", "private"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setVisibility(option)}
                    data-active={visibility === option}
                    className="rounded-2xl border border-[#e5e5e5] bg-white px-4 py-4 text-left transition-colors hover:border-[#111] data-[active=true]:border-[#111] data-[active=true]:bg-[#111] data-[active=true]:text-white"
                  >
                    <span className="block text-[15px] font-bold">
                      {option === "public" ? "공개방" : "비공개방"}
                    </span>
                    <span className="mt-1 block text-[12px] leading-[1.5] opacity-70">
                      {option === "public" ? "로비에 표시" : "초대 링크로 입장"}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/card-service/rooms")}
              className="h-12 rounded-xl border border-[#e5e5e5] px-5 text-[14px] font-bold text-[#666] transition-colors hover:border-[#111] hover:text-[#111]"
            >
              로비로 돌아가기
            </button>
            <button
              type="submit"
              className="h-12 rounded-xl bg-[#111] px-6 text-[14px] font-bold text-white transition-colors hover:bg-[#333]"
            >
              카드방 화면 확인
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
