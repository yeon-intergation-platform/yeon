"use client";
import { useRef, useState } from "react";
import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { YeonText, YeonView } from "@yeon/ui";

type Feedback = { type: "ok" | "err"; text: string } | null;

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function ProfileEditSection({
  initialDisplayName,
  initialAvatarUrl,
}: {
  initialDisplayName: string | null;
  initialAvatarUrl: string | null;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetchYeon("/api/v1/card-decks/assets", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = (await response.json().catch(() => null)) as {
        imageUrl?: string;
        message?: string;
      } | null;
      if (!response.ok || !data?.imageUrl) {
        throw new Error(data?.message ?? "이미지를 업로드하지 못했습니다.");
      }
      setAvatarUrl(data.imageUrl);
    } catch (error) {
      setFeedback({
        type: "err",
        text:
          error instanceof Error
            ? error.message
            : "이미지를 업로드하지 못했습니다.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (displayName.trim().length < 1) {
      setFeedback({ type: "err", text: "닉네임을 입력해 주세요." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const response = await fetchYeon("/api/v1/user-profile/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), avatarUrl }),
      });
      const data = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok) {
        throw new Error(data?.message ?? "프로필을 저장하지 못했습니다.");
      }
      setFeedback({ type: "ok", text: "프로필을 저장했어요." });
    } catch (error) {
      setFeedback({
        type: "err",
        text:
          error instanceof Error
            ? error.message
            : "프로필을 저장하지 못했습니다.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="text-[15px] font-bold text-[#111]"
      >
        프로필 등록
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="mt-1 text-[12px] leading-[1.6] text-[#888]"
      >
        닉네임과 프로필 사진은 게임 댓글 등 사이트 곳곳에 표시됩니다.
      </YeonText>

      <YeonView className="mt-5 flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="프로필 사진"
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6b5bd2] text-[24px] font-bold text-white"
          >
            {initialOf(displayName)}
          </span>
        )}
        <YeonView className="flex flex-col gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFile}
            className="hidden"
            id="profile-avatar-input"
          />
          <label
            htmlFor="profile-avatar-input"
            className="inline-flex w-fit cursor-pointer items-center rounded-full border border-[#e5e5e5] bg-white px-4 py-2 text-[13px] font-semibold text-[#111] transition-colors hover:border-[#6b5bd2]"
          >
            {uploading ? "업로드 중..." : "사진 변경"}
          </label>
          {avatarUrl ? (
            <button
              type="button"
              onClick={() => setAvatarUrl(null)}
              className="w-fit text-[11px] text-[#bbb] hover:text-[#d2685b]"
            >
              사진 제거
            </button>
          ) : null}
        </YeonView>
      </YeonView>

      <YeonView className="mt-5">
        <label
          htmlFor="profile-nickname-input"
          className="text-[12px] font-semibold text-[#666]"
        >
          닉네임
        </label>
        <input
          id="profile-nickname-input"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={80}
          placeholder="닉네임"
          className="mt-1.5 w-full max-w-[360px] rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#6b5bd2]"
        />
      </YeonView>

      <YeonView className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="rounded-full bg-[#6b5bd2] px-6 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {feedback ? (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={`text-[12px] ${feedback.type === "ok" ? "text-[#3a9a5c]" : "text-[#d2685b]"}`}
          >
            {feedback.text}
          </YeonText>
        ) : null}
      </YeonView>
    </YeonView>
  );
}
