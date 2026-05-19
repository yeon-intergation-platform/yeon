"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  StarLobbyDiscordWebhookAdminStatusResponse,
  StarLobbyDiscordWebhookTestResponse,
} from "@yeon/api-contract/star-lobby";
import { type FormEvent, useState } from "react";

async function parseErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as {
      message?: string;
      error?: string;
    };
    return body.message ?? body.error ?? fallback;
  } catch {
    return fallback;
  }
}

function toTestButtonViewState(isPending: boolean) {
  return {
    disabledWhileSending: isPending,
    label: isPending ? "테스트 보내는 중" : "테스트 보내기",
  };
}

function StatusCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn" | "good";
}) {
  const valueClassName =
    tone === "warn"
      ? "text-amber-700"
      : tone === "good"
        ? "text-emerald-700"
        : "text-[#111]";
  return (
    <div className="rounded-2xl border border-[#ececec] bg-white p-5">
      <p className="text-[13px] font-bold text-[#777]">{label}</p>
      <p className={`mt-2 text-[24px] font-black ${valueClassName}`}>{value}</p>
    </div>
  );
}

export function StarLobbyDiscordOps() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["admin", "star-lobby", "discord-status"],
    queryFn: async () => {
      const response = await fetch("/api/v1/star-lobby/admin/discord-status", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            "스타 로비 Discord 운영 상태를 불러오지 못했습니다."
          )
        );
      }
      return (await response.json()) as StarLobbyDiscordWebhookAdminStatusResponse;
    },
  });

  const testMutation = useMutation({
    mutationFn: async (nextWebhookUrl: string) => {
      const response = await fetch("/api/v1/star-lobby/admin/discord-test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ webhookUrl: nextWebhookUrl }),
      });
      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            "스타 로비 Discord 테스트 알림을 보내지 못했습니다."
          )
        );
      }
      return (await response.json()) as StarLobbyDiscordWebhookTestResponse;
    },
    onSuccess: () => {
      setMessage(
        "테스트 Discord 알림을 보냈습니다. 입력한 채널에서 메시지를 확인해 주세요."
      );
    },
    onError: (error) => {
      setMessage(
        error instanceof Error
          ? error.message
          : "스타 로비 Discord 테스트 알림을 보내지 못했습니다."
      );
    },
  });

  function handleTestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("테스트 Discord 알림을 보내는 중입니다.");
    testMutation.mutate(webhookUrl);
  }

  const status = statusQuery.data;
  const testButtonViewState = toTestButtonViewState(testMutation.isPending);

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-6 py-10 text-[#111]">
      <div className="mx-auto max-w-5xl">
        <p className="text-[13px] font-black uppercase tracking-[0.24em] text-[#555]">
          Star Lobby Ops
        </p>
        <h1 className="mt-3 text-[34px] font-black tracking-[-0.04em]">
          스타 로비 Discord 알림 운영 확인
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#555]">
          Discord 봇 토큰이나 전역 Discord 환경변수 없이 배포됩니다. 단,
          운영에서 유저 웹훅 URL을 저장하려면 보호 키가 설정되어 있어야 합니다.
          테스트 발송은 URL을 저장하지 않고 즉시 전송 경로만 확인합니다.
        </p>

        {statusQuery.error ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-700">
            {statusQuery.error instanceof Error
              ? statusQuery.error.message
              : "운영 상태를 불러오지 못했습니다."}
          </p>
        ) : null}

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <StatusCard
            label="Discord 전역 env 필요"
            tone="good"
            value={status?.globalDiscordEnvRequired ? "필요" : "불필요"}
          />
          <StatusCard
            label="웹훅 저장 가능"
            tone={status?.webhookPersistenceAllowed ? "good" : "warn"}
            value={status?.webhookPersistenceAllowed ? "가능" : "보호 키 필요"}
          />
          <StatusCard
            label="Spring 내부 토큰"
            tone={status?.springInternalTokenConfigured ? "good" : "warn"}
            value={status?.springInternalTokenConfigured ? "설정됨" : "미설정"}
          />
          <StatusCard
            label="실시간 이벤트 URL"
            tone={status?.realtimeEventsUrlConfigured ? "good" : "warn"}
            value={status?.realtimeEventsUrlConfigured ? "설정됨" : "미설정"}
          />
          <StatusCard
            label="실시간 내부 토큰"
            tone={status?.realtimeInternalTokenConfigured ? "good" : "warn"}
            value={
              status?.realtimeInternalTokenConfigured ? "설정됨" : "미설정"
            }
          />
          <StatusCard
            label="보호 키 설정"
            tone={status?.secretConfigured ? "good" : "warn"}
            value={status?.secretConfigured ? "설정됨" : "기본값"}
          />
          <StatusCard
            label="등록 웹훅"
            value={String(status?.registeredWebhookCount ?? "-")}
          />
          <StatusCard
            label="활성 웹훅"
            value={String(status?.enabledWebhookCount ?? "-")}
          />
        </section>

        <section className="mt-8 rounded-3xl border border-[#e5e5e5] bg-white p-6">
          <h2 className="text-[22px] font-black tracking-[-0.03em]">
            테스트 발송
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#666]">
            운영에서 실제 Discord 웹훅 URL을 임시로 입력해 전송 경로를
            확인합니다. URL은 저장하지 않고 테스트 요청에만 사용합니다.
          </p>
          <form
            className="mt-5 flex flex-col gap-3 md:flex-row"
            onSubmit={handleTestSubmit}
          >
            <input
              className="min-w-0 flex-1 rounded-2xl border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#111]"
              onChange={(event) => setWebhookUrl(event.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
            />
            <button
              className="rounded-2xl bg-[#111] px-5 py-3 text-[14px] font-black text-white disabled:cursor-not-allowed disabled:bg-[#aaa]"
              disabled={
                testButtonViewState.disabledWhileSending ||
                webhookUrl.trim().length === 0
              }
              type="submit"
            >
              {testButtonViewState.label}
            </button>
          </form>
          {message ? (
            <p className="mt-4 rounded-2xl bg-[#f2f2f2] p-4 text-[14px] text-[#333]">
              {message}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
