"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { CharacterSprite } from "@/features/typing-service/character-sprite";
import { findCharacter } from "@/features/typing-service/characters";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import { getGuestDeckDetail } from "@/lib/guest-card-service-store";
import { useIsAuthenticated } from "./auth-context";
import { createCardRoom, useCardRoomProfile, useDeckList } from "./hooks";

export function CardRoomCreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("서로 확인하는 카드방");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { profile, guestId, setProfile } = useCardRoomProfile();
  const [nickname, setNickname] = useState(profile.nickname);
  const isAuthenticated = useIsAuthenticated();
  const decksQuery = useDeckList();
  const decks = decksQuery.data ?? [];
  const { settings } = useTypingSettings();
  const frameOverrides = useCharacterFrameOverrides();
  const character = findCharacter(profile.characterId);

  const selectedDeck = useMemo(() => decks.find((deck) => deck.id === selectedDeckId) ?? decks[0], [decks, selectedDeckId]);

  async function submit() {
    if (!selectedDeck) { setErrorMessage("카드가 있는 덱을 먼저 만들어 주세요."); return; }
    setIsSubmitting(true); setErrorMessage(null);
    const nextProfile = { nickname: nickname.trim() || "Guest", characterId: profile.characterId };
    setProfile(nextProfile);
    try {
      const payload = isAuthenticated
        ? { title: title.trim() || "카드방", visibility, deckId: selectedDeck.id, profile: nextProfile }
        : await (async () => {
            const detail = await getGuestDeckDetail(selectedDeck.id);
            if (!detail || detail.items.length === 0) throw new Error("카드가 있는 게스트 덱이 필요합니다.");
            return {
              title: title.trim() || "카드방",
              visibility,
              guestDeck: { title: detail.deck.title, items: detail.items.map((item) => ({ frontText: item.frontText, backText: item.backText })) },
              profile: nextProfile,
            };
          })();
      const created = await createCardRoom(payload, guestId);
      if (created.participant) sessionStorage.setItem(`yeon-card-room-participant:${created.room.id}`, created.participant.id);
      router.push(`/card-service/rooms/${created.room.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "카드방을 만들지 못했습니다.");
    } finally { setIsSubmitting(false); }
  }

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <CommonProductHeader activeService="card" />
      <main className="mx-auto grid max-w-[1040px] gap-8 px-6 py-10 md:grid-cols-[360px_minmax(0,1fr)] md:px-10">
        <aside className="rounded-[28px] border border-[#e5e5e5] bg-[#fafafa] p-6">
          <h1 className="text-[28px] font-black tracking-[-0.04em] text-[#111]">카드방 만들기</h1>
          <p className="mt-3 text-[14px] leading-[1.7] text-[#666]">방을 만들면 현재 덱 내용이 Spring 카드방 스냅샷으로 고정됩니다. 이후 덱을 수정해도 이 방의 카드는 바뀌지 않습니다.</p>
          <div className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-4">
            <p className="text-[13px] font-bold text-[#666]">카드방 프로필</p>
            <div className="mt-4 flex items-center gap-4"><div className="flex h-[88px] w-[88px] items-end justify-center overflow-hidden rounded-xl bg-[#f5f5f5]"><CharacterSprite character={character} maxHeight={82} sequenceOverride={frameOverrides[character.id]} /></div><div><p className="text-[17px] font-bold text-[#111]">{profile.nickname}</p><p className="mt-1 text-[13px] font-semibold text-[#777]">{character.label[settings.locale]}</p></div></div>
          </div>
        </aside>

        <form className="rounded-[28px] border border-[#e5e5e5] bg-white p-6" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <h2 className="text-[18px] font-bold text-[#111]">실제 방 설정</h2>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-[13px] font-semibold text-[#666]">방 제목<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} className="h-12 rounded-xl border border-[#d9d9d9] px-4 text-[15px] font-semibold text-[#111] outline-none focus:border-[#111]" /></label>
            <label className="grid gap-2 text-[13px] font-semibold text-[#666]">닉네임<input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={40} className="h-12 rounded-xl border border-[#d9d9d9] px-4 text-[15px] font-semibold text-[#111] outline-none focus:border-[#111]" /></label>
            <label className="grid gap-2 text-[13px] font-semibold text-[#666]">사용할 덱<select value={selectedDeck?.id ?? ""} onChange={(event) => setSelectedDeckId(event.target.value)} className="h-12 rounded-xl border border-[#d9d9d9] px-4 text-[15px] font-semibold text-[#111] outline-none focus:border-[#111]"><option value="" disabled>{decksQuery.isLoading ? "덱 불러오는 중" : "덱 선택"}</option>{decks.map((deck) => <option key={deck.id} value={deck.id}>{deck.title} · {deck.itemCount}장</option>)}</select></label>
            <fieldset className="grid gap-2"><legend className="text-[13px] font-semibold text-[#666]">공개 여부</legend><div className="grid gap-3 sm:grid-cols-2">{(["public", "private"] as const).map((option) => <button key={option} type="button" onClick={() => setVisibility(option)} data-active={visibility === option} className="rounded-2xl border border-[#e5e5e5] bg-white px-4 py-4 text-left transition-colors hover:border-[#111] data-[active=true]:border-[#111] data-[active=true]:bg-[#111] data-[active=true]:text-white"><span className="block text-[15px] font-bold">{option === "public" ? "공개방" : "비공개방"}</span><span className="mt-1 block text-[12px] leading-[1.5] opacity-70">{option === "public" ? "로비에 표시" : "초대 링크로 입장"}</span></button>)}</div></fieldset>
          </div>
          {errorMessage ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">{errorMessage}</p> : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => router.push("/card-service/decks")} className="h-12 rounded-xl border border-[#e5e5e5] px-5 text-[14px] font-bold text-[#666] transition-colors hover:border-[#111] hover:text-[#111]">내 덱 보기</button><button type="button" onClick={() => router.push("/card-service/rooms")} className="h-12 rounded-xl border border-[#e5e5e5] px-5 text-[14px] font-bold text-[#666] transition-colors hover:border-[#111] hover:text-[#111]">로비로 돌아가기</button><button type="submit" disabled={isSubmitting || !selectedDeck} className="h-12 rounded-xl bg-[#111] px-6 text-[14px] font-bold text-white transition-colors hover:bg-[#333] disabled:bg-[#ccc]">{isSubmitting ? "생성 중..." : "실제 카드방 만들기"}</button></div>
        </form>
      </main>
    </div>
  );
}
