"use client";
import { useState } from "react";
import {
  YeonButton,
  YeonModal,
  YeonSurface,
  YeonText,
  YeonView,
  YEON_WEB_SHADOW_CLASS,
} from "@yeon/ui";
import { useYeonEscapeKey } from "@yeon/ui/hooks/YeonBrowserHooks";
import { GuestStoreMergeContractError } from "@/lib/guest-card-service-store";
import { useMergeGuestDecks } from "../hooks/use-merge-guest";

type MergeDialogViewState =
  | { kind: "confirm" }
  | { kind: "merging" }
  | { kind: "success"; createdDeckCount: number; createdItemCount: number }
  | { kind: "error"; message: string };

type MergeGuestDialogProps = {
  guestDeckCount: number;
  onClose: () => void;
};

function getMergeGuestDialogErrorMessage(error: unknown) {
  if (error instanceof GuestStoreMergeContractError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return `덱 이관에 실패했습니다. 원인: ${error.trim()}`;
  }

  return `덱 이관에 실패했습니다. 원인: 처리할 수 없는 오류 형식(${String(error)})`;
}

export function MergeGuestDialog({
  guestDeckCount,
  onClose,
}: MergeGuestDialogProps) {
  const [state, setState] = useState<MergeDialogViewState>({ kind: "confirm" });
  const mutation = useMergeGuestDecks();

  const isBusy = state.kind === "merging";

  useYeonEscapeKey(onClose, !isBusy);

  async function handleAccept() {
    setState({ kind: "merging" });
    try {
      const result = await mutation.mutateAsync();
      setState({
        kind: "success",
        createdDeckCount: result.createdDeckCount,
        createdItemCount: result.createdItemCount,
      });
    } catch (error) {
      setState({
        kind: "error",
        message: getMergeGuestDialogErrorMessage(error),
      });
    }
  }

  return (
    <YeonModal
      visible
      onRequestClose={isBusy ? undefined : onClose}
      aria-labelledby="merge-guest-dialog-title"
      className="fixed inset-0 z-30 m-0 flex h-auto max-h-none w-auto max-w-none items-center justify-center border-0 bg-[#111]/40 p-0"
    >
      <YeonSurface
        className={`mx-6 w-full max-w-[440px] rounded-[24px] p-6 ${YEON_WEB_SHADOW_CLASS.dialog}`}
      >
        {state.kind === "success" ? (
          <YeonView className="grid gap-4">
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              id="merge-guest-dialog-title"
              className="m-0 text-[20px] font-black tracking-[-0.02em]"
            >
              계정에 덱을 추가했어요
            </YeonText>
            <YeonText
              as="p"
              variant="body"
              tone="secondary"
              className="m-0 text-[14px]"
            >
              덱 {state.createdDeckCount}개 · 카드 {state.createdItemCount}장을
              계정으로 이관했습니다. 이제 다른 기기에서도 같은 덱으로 공부할 수
              있어요.
            </YeonText>
            <YeonButton
              type="button"
              onClick={onClose}
              variant="primary"
              size="lg"
              className="min-h-12 rounded-[14px]"
            >
              확인
            </YeonButton>
          </YeonView>
        ) : (
          <YeonView className="grid gap-4">
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              id="merge-guest-dialog-title"
              className="m-0 text-[20px] font-black tracking-[-0.02em]"
            >
              방금 만든 덱 {guestDeckCount}개를 계정에 추가할까요?
            </YeonText>
            <YeonText
              as="p"
              variant="body"
              tone="secondary"
              className="m-0 text-[14px]"
            >
              로그인 전에 만들어 둔 덱을 계정으로 가져옵니다. 이관한 뒤에는 이
              기기에서만 보이던 덱이 다른 기기에서도 보이게 됩니다.
            </YeonText>

            {state.kind === "error" ? (
              <YeonText
                as="p"
                role="alert"
                variant="caption"
                tone="primary"
                className="m-0 rounded-[12px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-[13px] leading-[1.55]"
              >
                {state.message}
              </YeonText>
            ) : null}

            <YeonView className="flex flex-wrap items-center justify-end gap-2">
              <YeonButton
                type="button"
                onClick={onClose}
                disabled={isBusy}
                variant="secondary"
                size="lg"
                className="min-h-12 rounded-[14px]"
              >
                나중에
              </YeonButton>
              <YeonButton
                type="button"
                onClick={() => {
                  void handleAccept();
                }}
                disabled={isBusy}
                autoFocus
                variant="primary"
                size="lg"
                className="min-h-12 rounded-[14px]"
              >
                {isBusy ? "이관 중..." : "계정에 추가"}
              </YeonButton>
            </YeonView>
          </YeonView>
        )}
      </YeonSurface>
    </YeonModal>
  );
}
