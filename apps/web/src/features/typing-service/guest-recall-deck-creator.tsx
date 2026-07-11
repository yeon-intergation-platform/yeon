"use client";

import { CARD_TEXT_MAX_LENGTH } from "@yeon/api-contract/card-decks";
import { RECALL_AI_DECK_MAX_ITEMS } from "@yeon/api-contract/recall";
import {
  YeonButton,
  YeonField,
  YeonForm,
  YeonIcon,
  YeonLabel,
  YeonText,
  YeonView,
  type YeonFormElement,
  type YeonFormEvent,
} from "@yeon/ui";
import {
  createRecallIdempotencyKey,
  useYeonCardRecallRepository,
} from "@yeon/ui/runtime/ports/card-deck";
import {
  useYeonMutation as useMutation,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/runtime/YeonQuery";
import { useState } from "react";
import { cardServiceQueryKeys } from "../card-service/card-service-query-keys";

type GuestDraftItem = {
  key: string;
  frontText: string;
  backText: string;
};

function createEmptyItem(): GuestDraftItem {
  return {
    key: createRecallIdempotencyKey(),
    frontText: "",
    backText: "",
  };
}

export function GuestRecallDeckCreator({
  onCreated,
}: {
  onCreated: (deckId: string) => void;
}) {
  const repository = useYeonCardRecallRepository();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<GuestDraftItem[]>([createEmptyItem()]);

  const createMutation = useMutation({
    mutationFn: () =>
      repository.createDeckWithItems({
        idempotencyKey: createRecallIdempotencyKey(),
        title: title.trim(),
        description: null,
        items: items.map(({ frontText, backText }) => ({
          frontText: frontText.trim(),
          backText: backText.trim(),
        })),
      }),
    onSuccess: async ({ deck }) => {
      await queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.decks(false),
      });
      setTitle("");
      setItems([createEmptyItem()]);
      onCreated(deck.id);
    },
  });
  const isCreating = createMutation.isPending;

  const canCreate = Boolean(
    title.trim() &&
    items.length > 0 &&
    items.every(({ frontText, backText }) =>
      Boolean(frontText.trim() && backText.trim())
    ) &&
    !isCreating
  );

  function updateItem(
    key: string,
    field: "frontText" | "backText",
    value: string
  ) {
    setItems((current) =>
      current.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  }

  function submit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();
    if (canCreate) createMutation.mutate();
  }

  return (
    <YeonForm
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4"
    >
      <YeonView>
        <YeonText
          as="h3"
          variant="unstyled"
          tone="inherit"
          className="text-[16px] font-extrabold text-[#111]"
        >
          이 브라우저에 백지 덱 만들기
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="mt-1 text-[13px] leading-5 text-[#666]"
        >
          질문과 답은 현재 브라우저의 백지 서비스에만 저장됩니다. 로그인하면
          계정으로 이관해 카드 서비스와 다른 기기에서도 사용할 수 있습니다.
        </YeonText>
      </YeonView>

      <YeonLabel className="flex flex-col gap-2">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-semibold text-[#555]"
        >
          덱 이름
        </YeonText>
        <YeonField
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          disabled={isCreating}
          placeholder="예: 한국사 핵심 개념"
        />
      </YeonLabel>

      {items.map((item, index) => (
        <YeonView
          key={item.key}
          className="grid gap-3 border-t border-[#e5e5e5] pt-4 sm:grid-cols-2"
        >
          <YeonLabel className="flex min-w-0 flex-col gap-2">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="text-[13px] font-semibold text-[#555]"
            >
              카드 {index + 1} 질문
            </YeonText>
            <YeonField
              as="textarea"
              rows={3}
              value={item.frontText}
              onChange={(event) =>
                updateItem(item.key, "frontText", event.target.value)
              }
              maxLength={CARD_TEXT_MAX_LENGTH}
              disabled={isCreating}
              placeholder="질문을 입력하세요."
            />
          </YeonLabel>
          <YeonLabel className="flex min-w-0 flex-col gap-2">
            <YeonView className="flex items-center justify-between gap-2">
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="text-[13px] font-semibold text-[#555]"
              >
                답
              </YeonText>
              {items.length > 1 ? (
                <YeonButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  aria-label={`카드 ${index + 1} 삭제`}
                  disabled={isCreating}
                  onClick={() =>
                    setItems((current) =>
                      current.filter(({ key }) => key !== item.key)
                    )
                  }
                >
                  <YeonIcon name="trash" size={15} aria-hidden="true" />
                </YeonButton>
              ) : null}
            </YeonView>
            <YeonField
              as="textarea"
              rows={3}
              value={item.backText}
              onChange={(event) =>
                updateItem(item.key, "backText", event.target.value)
              }
              maxLength={CARD_TEXT_MAX_LENGTH}
              disabled={isCreating}
              placeholder="기억해야 할 답을 입력하세요."
            />
          </YeonLabel>
        </YeonView>
      ))}

      <YeonView className="flex flex-wrap justify-between gap-2">
        <YeonButton
          type="button"
          variant="secondary"
          disabled={isCreating || items.length >= RECALL_AI_DECK_MAX_ITEMS}
          onClick={() => setItems((current) => [...current, createEmptyItem()])}
        >
          <YeonIcon name="plus" size={16} aria-hidden="true" />
          카드 추가
        </YeonButton>
        <YeonButton type="submit" variant="primary" disabled={!canCreate}>
          {isCreating ? "저장 중..." : "덱 만들고 선택"}
        </YeonButton>
      </YeonView>
      {createMutation.isError ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-semibold text-red-600"
        >
          로컬 덱을 저장하지 못했습니다. 브라우저 저장소 설정을 확인해 주세요.
        </YeonText>
      ) : null}
    </YeonForm>
  );
}
