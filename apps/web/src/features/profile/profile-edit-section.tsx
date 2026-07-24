"use client";
import { useRef, useState } from "react";
import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { YeonText, YeonView } from "@yeon/ui";
import { getProfileText, type ProfileLanguage } from "./profile-i18n";

type Feedback = { type: "ok" | "err"; text: string } | null;

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function resolveProfileErrorMessage({
  fallback,
  language,
  serverMessage,
}: {
  fallback: string;
  language: ProfileLanguage;
  serverMessage?: string;
}) {
  if (language === "ko") {
    return serverMessage ?? fallback;
  }

  return fallback;
}

export function ProfileEditSection({
  initialDisplayName,
  initialAvatarUrl,
  language,
}: {
  initialDisplayName: string | null;
  initialAvatarUrl: string | null;
  language: ProfileLanguage;
}) {
  const text = getProfileText(language).edit;
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
        throw new Error(
          resolveProfileErrorMessage({
            fallback: text.uploadFailed,
            language,
            serverMessage: data?.message,
          })
        );
      }
      setAvatarUrl(data.imageUrl);
    } catch (error) {
      setFeedback({
        type: "err",
        text: error instanceof Error ? error.message : text.uploadFailed,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (displayName.trim().length < 1) {
      setFeedback({ type: "err", text: text.displayNameRequired });
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
        throw new Error(
          resolveProfileErrorMessage({
            fallback: text.saveFailed,
            language,
            serverMessage: data?.message,
          })
        );
      }
      setFeedback({ type: "ok", text: text.saveOk });
    } catch (error) {
      setFeedback({
        type: "err",
        text: error instanceof Error ? error.message : text.saveFailed,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="text-[16px] font-bold text-[#111]"
      >
        {text.title}
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="mt-1.5 text-[12px] leading-[1.65] text-[#666]"
      >
        {text.description}
      </YeonText>

      <YeonView className="mt-6 grid gap-6 sm:grid-cols-[92px_minmax(0,1fr)] sm:items-start">
        <YeonView className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={text.avatarAlt}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111] text-[24px] font-bold text-white"
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
              className="inline-flex min-h-10 w-fit cursor-pointer items-center rounded-full border border-[#e5e5e5] bg-white px-4 text-[13px] font-semibold text-[#111] transition-colors hover:border-[#111]"
            >
              {uploading ? text.uploading : text.changePhoto}
            </label>
            {avatarUrl ? (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="w-fit text-[11px] text-[#aaa] hover:text-[#111]"
              >
                {text.removePhoto}
              </button>
            ) : null}
          </YeonView>
        </YeonView>

        <YeonView className="min-w-0">
          <label
            htmlFor="profile-nickname-input"
            className="block text-[12px] font-semibold text-[#666]"
          >
            {text.displayNameLabel}
          </label>
          <input
            id="profile-nickname-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={80}
            autoComplete="nickname"
            placeholder={text.displayNamePlaceholder}
            className="mt-2 block h-12 w-full max-w-[420px] rounded-full border border-[#dedede] bg-[#fafafa] px-4 text-[14px] text-[#111] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#aaa] focus:border-[#111] focus:bg-white focus:ring-2 focus:ring-[#111]/10"
          />

          <YeonView className="mt-4 flex min-h-11 items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="min-h-11 rounded-full bg-[#111] px-6 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? text.saving : text.save}
            </button>
            {feedback ? (
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="text-[12px] text-[#666]"
              >
                {feedback.text}
              </YeonText>
            ) : null}
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
