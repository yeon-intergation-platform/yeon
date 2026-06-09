import type { CreateCardRoomBody } from "@yeon/api-contract/card-rooms";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
} from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonBottomSheetForm as BottomSheetForm,
  YeonBottomSheetModal as BottomSheetModal,
  YeonButton,
  YeonFormIntro as FormIntro,
  YeonText,
  YeonTextField as TextField,
  YeonView,
  createYeonStyleSheet,
  showYeonAlert,
  yeonMobileAppColors,
} from "@yeon/ui/native";
import { useMemo, useState } from "react";
import { cardServiceQueryKeys } from "../../../services/card-service/query-keys";
import { cardRoomApi } from "../../../services/card-rooms/client";
import {
  writeCardRoomParticipantId,
  writeCardRoomParticipantToken,
} from "../../../services/card-rooms/profile-storage";
import { CARD_SERVICE_TEXT } from "../card-service-copy";
import { getCardServiceErrorMessage } from "../error-message";
import { useCardSession } from "../card-session-context";
import { createMobileCardDeckRepository } from "../runtime-adapters/card-deck-repository";
import { createMobileCardItemRepository } from "../runtime-adapters/card-item-repository";
import { useCardRoomIdentity } from "./use-card-room-identity";

type CardRoomCreateSheetProps = {
  visible: boolean;
  onClose: () => void;
  onCreated: (roomId: string) => void;
};

class CardRoomCreateInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardRoomCreateInputError";
  }
}

export function CardRoomCreateSheet({
  visible,
  onClose,
  onCreated,
}: CardRoomCreateSheetProps) {
  const { isSignedIn, sessionToken } = useCardSession();
  const { profile, guestId } = useCardRoomIdentity();
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const deckRepository = useMemo(
    () => createMobileCardDeckRepository({ isSignedIn, sessionToken }),
    [isSignedIn, sessionToken]
  );
  const itemRepository = useMemo(
    () =>
      createMobileCardItemRepository({
        mode: isSignedIn ? "server" : "guest",
        sessionToken,
      }),
    [isSignedIn, sessionToken]
  );

  const decksQuery = useQuery({
    enabled: visible,
    queryFn: () => deckRepository.listDecks(),
    queryKey: cardServiceQueryKeys.decks(isSignedIn),
  });
  const decks = decksQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !guestId) {
        throw new CardRoomCreateInputError(
          "카드방 생성에 필요한 참가자 프로필 또는 게스트 식별자를 아직 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
        );
      }
      const deck = decks.find((entry) => entry.id === selectedDeckId);
      if (!deck) {
        throw new CardRoomCreateInputError(
          "카드방을 만들 덱을 선택하지 않았습니다. 카드가 1장 이상 있는 덱을 선택해 주세요."
        );
      }

      const roomTitle = title.trim() || deck.title;
      let body: CreateCardRoomBody;

      if (isSignedIn) {
        body = { title: roomTitle, visibility, deckId: deck.id, profile };
      } else {
        // 게스트는 덱 스냅샷을 그대로 올린다(서버에 게스트 덱 식별자가 없음).
        const detail = await itemRepository.getDeckDetail(deck.id);
        body = {
          title: roomTitle,
          visibility,
          guestDeck: {
            title: deck.title,
            items: detail.items.map((item) => ({
              frontText: item.frontText,
              backText: item.backText,
            })),
          },
          profile,
        };
      }

      const response = await cardRoomApi.createRoom(body, guestId);
      // idx-117: participant.id가 있을 때만 저장(빈 문자열 영구 저장 방지).
      if (response.participant?.id) {
        await writeCardRoomParticipantId(
          response.room.id,
          response.participant.id
        );
        // 방장도 생성 응답의 토큰을 저장해 방 화면이 재입장 없이 실시간에 연결하게 한다.
        if (response.participantToken) {
          await writeCardRoomParticipantToken(
            response.room.id,
            response.participantToken
          );
        }
      }
      return response.room.id;
    },
    onSuccess: (roomId) => {
      setTitle("");
      setSelectedDeckId(null);
      onCreated(roomId);
    },
  });

  async function handleCreate() {
    try {
      await createMutation.mutateAsync();
    } catch (error) {
      showYeonAlert(
        CARD_SERVICE_TEXT.rooms.createErrorTitle,
        getCardServiceErrorMessage(
          error,
          CARD_SERVICE_TEXT.rooms.createErrorTitle
        )
      );
    }
  }

  const canSubmit =
    selectedDeckId !== null && !createMutation.isPending && guestId !== null;

  return (
    <BottomSheetModal
      closeAccessibilityLabel={CARD_SERVICE_TEXT.shared.closeModalLabel}
      onClose={onClose}
      visible={visible}
    >
      <BottomSheetForm>
        <FormIntro
          hint={CARD_SERVICE_TEXT.rooms.createSubtitle}
          title={CARD_SERVICE_TEXT.rooms.createTitle}
        />
        <TextField
          label={CARD_SERVICE_TEXT.rooms.createRoomNameLabel}
          onChangeText={setTitle}
          placeholder={CARD_SERVICE_TEXT.rooms.createRoomNamePlaceholder}
          value={title}
        />

        <YeonText style={styles.fieldLabel}>
          {CARD_SERVICE_TEXT.rooms.createDeckLabel}
        </YeonText>
        {decks.length === 0 ? (
          <YeonText style={styles.emptyHint}>
            {CARD_SERVICE_TEXT.rooms.createDeckEmpty}
          </YeonText>
        ) : (
          <YeonView style={styles.deckList}>
            {decks.map((deck) => {
              const active = deck.id === selectedDeckId;
              return (
                <YeonButton
                  accessibilityRole="button"
                  aria-label={deck.title}
                  disabled={deck.itemCount === 0}
                  key={deck.id}
                  onPress={() => setSelectedDeckId(deck.id)}
                  style={[styles.deckChip, active && styles.deckChipActive]}
                >
                  <YeonText
                    style={[
                      styles.deckChipText,
                      active && styles.deckChipTextActive,
                      deck.itemCount === 0 && styles.deckChipDisabled,
                    ]}
                  >
                    {deck.title} ({deck.itemCount})
                  </YeonText>
                </YeonButton>
              );
            })}
          </YeonView>
        )}

        <YeonText style={styles.fieldLabel}>
          {CARD_SERVICE_TEXT.rooms.createVisibilityLabel}
        </YeonText>
        <YeonView style={styles.visibilityRow}>
          {(["public", "private"] as const).map((value) => {
            const active = visibility === value;
            return (
              <YeonButton
                accessibilityRole="button"
                aria-label={
                  value === "public"
                    ? CARD_SERVICE_TEXT.rooms.visibilityPublic
                    : CARD_SERVICE_TEXT.rooms.visibilityPrivate
                }
                key={value}
                onPress={() => setVisibility(value)}
                style={[
                  styles.visibilityChip,
                  active && styles.visibilityChipActive,
                ]}
              >
                <YeonText
                  style={[
                    styles.visibilityText,
                    active && styles.visibilityTextActive,
                  ]}
                >
                  {value === "public"
                    ? CARD_SERVICE_TEXT.rooms.visibilityPublic
                    : CARD_SERVICE_TEXT.rooms.visibilityPrivate}
                </YeonText>
              </YeonButton>
            );
          })}
        </YeonView>

        <ActionButton
          disabled={!canSubmit}
          label={
            createMutation.isPending
              ? CARD_SERVICE_TEXT.rooms.createBusyLabel
              : CARD_SERVICE_TEXT.rooms.createSubmitLabel
          }
          onPress={handleCreate}
          variant="dark"
        />
      </BottomSheetForm>
    </BottomSheetModal>
  );
}

const styles = createYeonStyleSheet({
  fieldLabel: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  emptyHint: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    paddingVertical: 8,
  },
  deckList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  deckChip: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deckChipActive: {
    backgroundColor: yeonMobileAppColors.text,
    borderColor: yeonMobileAppColors.text,
  },
  deckChipText: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  deckChipTextActive: {
    color: yeonMobileAppColors.surfaceStrong,
  },
  deckChipDisabled: {
    color: yeonMobileAppColors.textMuted,
  },
  visibilityRow: {
    flexDirection: "row",
    gap: 8,
  },
  visibilityChip: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },
  visibilityChipActive: {
    backgroundColor: yeonMobileAppColors.text,
    borderColor: yeonMobileAppColors.text,
  },
  visibilityText: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  visibilityTextActive: {
    color: yeonMobileAppColors.surfaceStrong,
  },
});
