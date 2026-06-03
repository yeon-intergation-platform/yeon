"use client";
import type {
  StarLobbyDiscordWebhookAdminStatusResponse,
  StarLobbyDiscordWebhookTestResponse,
} from "@yeon/api-contract/star-lobby";
import { YeonButton, YeonField, YeonForm, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  fetchYeon,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { useState } from "react";
import type { YeonFormElement, YeonFormEvent } from "@yeon/ui/types";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
} from "@yeon/ui/runtime/YeonQuery";

async function parseErrorMessage(response: YeonResponse, fallback: string) {
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
      ? "text-[#666]"
      : tone === "good"
        ? "text-[#111]"
        : "text-[#111]";
  return (
    <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
      <YeonText
        variant="unstyled"
        tone="inherit"
        className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
      >
        {label}
      </YeonText>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className={`mt-2 text-[24px] font-black ${valueClassName}`}
      >
        {value}
      </YeonText>
    </YeonView>
  );
}

export function StarLobbyDiscordOps() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["admin", "star-lobby", "discord-status"],
    queryFn: async () => {
      const response = await fetchYeon(
        "/api/v1/star-lobby/admin/discord-status",
        {
          cache: "no-store",
        }
      );
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
      const response = await fetchYeon(
        "/api/v1/star-lobby/admin/discord-test",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ webhookUrl: nextWebhookUrl }),
        }
      );
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

  function handleTestSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();
    setMessage("테스트 Discord 알림을 보내는 중입니다.");
    testMutation.mutate(webhookUrl);
  }

  const status = statusQuery.data;
  const testButtonViewState = toTestButtonViewState(testMutation.isPending);

  return (
    <YeonView
      as="main"
      className="min-h-screen bg-[#fafafa] px-6 py-10 text-[#111]"
    >
      <YeonView className="mx-auto max-w-5xl">
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-black uppercase tracking-[0.24em] text-[#666]"
        >
          Star Lobby Ops
        </YeonText>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="mt-3 text-[34px] font-black tracking-[-0.04em]"
        >
          스타 로비 Discord 알림 운영 확인
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="mt-3 max-w-2xl text-[15px] leading-7 text-[#666]"
        >
          Discord 봇 토큰이나 전역 Discord 환경변수 없이 배포됩니다. 단,
          운영에서 유저 웹훅 URL을 저장하려면 보호 키가 설정되어 있어야 합니다.
          테스트 발송은 URL을 저장하지 않고 즉시 전송 경로만 확인합니다.
        </YeonText>

        {statusQuery.error ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-6 rounded-2xl border border-[#e5e5e5] bg-white p-4 text-[14px] text-[#111]"
          >
            {statusQuery.error instanceof Error
              ? statusQuery.error.message
              : "운영 상태를 불러오지 못했습니다."}
          </YeonText>
        ) : null}

        <YeonView as="section" className="mt-8 grid gap-4 md:grid-cols-4">
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
        </YeonView>

        <YeonView
          as="section"
          className="mt-8 rounded-3xl border border-[#e5e5e5] bg-white p-6"
        >
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="text-[22px] font-black tracking-[-0.03em]"
          >
            테스트 발송
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-2 text-[14px] leading-6 text-[#666]"
          >
            운영에서 실제 Discord 웹훅 URL을 임시로 입력해 전송 경로를
            확인합니다. URL은 저장하지 않고 테스트 요청에만 사용합니다.
          </YeonText>
          <YeonForm
            className="mt-5 flex flex-col gap-3 md:flex-row"
            onSubmit={handleTestSubmit}
          >
            <YeonField
              className="min-w-0 flex-1 rounded-2xl px-4 py-3"
              onChange={(event) => setWebhookUrl(event.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
            />
            <YeonButton
              className="rounded-2xl px-5 py-3 text-[14px] font-black"
              disabled={
                testButtonViewState.disabledWhileSending ||
                webhookUrl.trim().length === 0
              }
              type="submit"
              variant="primary"
            >
              {testButtonViewState.label}
            </YeonButton>
          </YeonForm>
          {message ? (
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="mt-4 rounded-2xl bg-[#fafafa] p-4 text-[14px] text-[#111]"
            >
              {message}
            </YeonText>
          ) : null}
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
