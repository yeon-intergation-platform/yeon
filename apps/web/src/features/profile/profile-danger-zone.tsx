"use client";
import { useState } from "react";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";
import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { YeonText, YeonView } from "@yeon/ui";
import { getProfileText, type ProfileLanguage } from "./profile-i18n";

type Feedback = { type: "err"; text: string } | null;

export function ProfileDangerZone({ language }: { language: ProfileLanguage }) {
  const router = useYeonRouter();
  const text = getProfileText(language).danger;
  const [confirmation, setConfirmation] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [processing, setProcessing] = useState(false);
  const canSubmit = confirmation.trim() === text.confirmationValue;

  const handleWithdraw = async () => {
    if (!canSubmit || processing) {
      setFeedback({ type: "err", text: text.required });
      return;
    }

    setProcessing(true);
    setFeedback(null);
    try {
      const response = await fetchYeon("/api/v1/users/me", {
        method: "DELETE",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmation: confirmation.trim() }),
      });

      if (!response.ok) {
        throw new Error(text.failed);
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "err",
        text: error instanceof Error ? error.message : text.failed,
      });
    } finally {
      setProcessing(false);
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
        {text.title}
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="mt-2 text-[13px] leading-[1.7] text-[#666]"
      >
        {text.description}
      </YeonText>

      <YeonView className="mt-5 grid gap-2">
        <label
          htmlFor="profile-withdraw-confirmation"
          className="text-[12px] font-semibold text-[#666]"
        >
          {text.confirmationLabel}
        </label>
        <input
          id="profile-withdraw-confirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder={text.confirmationPlaceholder}
          className="w-full max-w-[360px] rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#111]"
        />
      </YeonView>

      <YeonView className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={!canSubmit || processing}
          className="rounded-full border border-[#111] bg-[#111] px-6 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? text.processing : text.action}
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
  );
}
