import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Href, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StateBlock } from "../../components/ui/state-block";
import { cardServiceApi } from "../../services/card-service/client";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import { parseAiCardInput } from "./card-input-parser";
import {
  createGuestCard,
  createGuestCards,
  deleteGuestCard,
  getGuestDeckDetail,
  updateGuestCard,
} from "../../services/card-service/storage";
import { colors } from "../../theme/colors";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
  resolveCardServiceSession,
} from "./card-service-session";

const CARD_SERVICE_DECK_PLAY_ROUTE =
  "/card-service/decks/[deckId]/play" as Href;

const SHEET_MODES = {
  bulk: "bulk",
  manual: "manual",
} as const;

type SheetMode = (typeof SHEET_MODES)[keyof typeof SHEET_MODES];
type SheetState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; item: CardDeckItemDto };

interface ParsedCardInput {
  backText: string;
  frontText: string;
}

interface CardDeckDetailScreenProps {
  deckId?: string;
}

function getCardServiceDeckPlayHref(deckId: string): Href {
  return {
    pathname: CARD_SERVICE_DECK_PLAY_ROUTE,
    params: { deckId },
  } as Href;
}

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replace(/\. /g, ". ")
    .replace(/\.$/, ".");
}

function getModeBadge(mode: CardServiceMode): string {
  return mode === CARD_SERVICE_MODE.server
    ? CARD_SERVICE_TEXT.detail.modeAuthenticatedLabel
    : CARD_SERVICE_TEXT.detail.modeGuestLabel;
}

export function CardDeckDetailScreen({ deckId }: CardDeckDetailScreenProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mode, setMode] = useState<CardServiceMode>(CARD_SERVICE_MODE.guest);
  const [isBooting, setBooting] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [sheetMode, setSheetMode] = useState<SheetMode>(SHEET_MODES.manual);
  const [sheetState, setSheetState] = useState<SheetState>({ kind: "closed" });
  const [activeMenuItemId, setActiveMenuItemId] = useState<string | null>(null);

  const detailQuery = useQuery({
    enabled: !isBooting && Boolean(deckId),
    queryFn: async () => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      if (mode === CARD_SERVICE_MODE.server && sessionToken) {
        return cardServiceApi.getCardDeckDetail(deckId, sessionToken);
      }
      const guestDetail = await getGuestDeckDetail(deckId);
      if (!guestDetail) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckMessage);
      }
      return guestDetail;
    },
    queryKey: deckId
      ? cardServiceQueryKeys.deck(deckId, mode === CARD_SERVICE_MODE.server)
      : ["card-service", "deck", "missing", mode],
  });

  const createMutation = useMutation({
    mutationFn: async (params: ParsedCardInput) => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      if (mode === CARD_SERVICE_MODE.server && sessionToken) {
        return cardServiceApi.createCardDeckItem(deckId, params, sessionToken);
      }
      return createGuestCard(deckId, params);
    },
    onSuccess: async () => {
      await invalidateDeck();
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async () => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      const cards = parseAiCardInput(bulkText);
      if (cards.length === 0) {
        throw new Error(CARD_SERVICE_TEXT.detail.noParseResultMessage);
      }

      if (mode === CARD_SERVICE_MODE.server && sessionToken) {
        for (const card of cards) {
          await cardServiceApi.createCardDeckItem(deckId, card, sessionToken);
        }
      } else {
        await createGuestCards(deckId, { items: cards });
      }

      return cards.length;
    },
    onSuccess: async (createdCount) => {
      setBulkText("");
      closeSheet();
      await invalidateDeck();
      Alert.alert(
        CARD_SERVICE_TEXT.detail.addCompleteTitle,
        `${createdCount}${CARD_SERVICE_TEXT.detail.addCompleteMessageSuffix}`
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: ParsedCardInput & { itemId: string }) => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      if (mode === CARD_SERVICE_MODE.server && sessionToken) {
        return cardServiceApi.updateCardDeckItem(
          deckId,
          params.itemId,
          { backText: params.backText, frontText: params.frontText },
          sessionToken
        );
      }
      return updateGuestCard(params.itemId, {
        backText: params.backText,
        frontText: params.frontText,
      });
    },
    onSuccess: async () => {
      closeSheet();
      await invalidateDeck();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      if (mode === CARD_SERVICE_MODE.server && sessionToken) {
        await cardServiceApi.deleteCardDeckItem(deckId, itemId, sessionToken);
        return;
      }
      await deleteGuestCard(itemId);
    },
    onSuccess: async () => {
      setActiveMenuItemId(null);
      await invalidateDeck();
    },
  });

  useEffect(() => {
    void bootstrapSession();
  }, []);

  async function bootstrapSession() {
    setBooting(true);
    const resolved = await resolveCardServiceSession();
    setMode(resolved.mode);
    setSessionToken(resolved.sessionToken);
    setBooting(false);
  }

  async function invalidateDeck() {
    if (!deckId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: cardServiceQueryKeys.deck(
        deckId,
        mode === CARD_SERVICE_MODE.server
      ),
    });
    await queryClient.invalidateQueries({
      queryKey: cardServiceQueryKeys.decks(mode === CARD_SERVICE_MODE.server),
    });
  }

  function openCreateSheet() {
    setFrontText("");
    setBackText("");
    setSheetMode(SHEET_MODES.manual);
    setSheetState({ kind: "create" });
  }

  function openEditSheet(item: CardDeckItemDto) {
    setFrontText(item.frontText);
    setBackText(item.backText);
    setSheetMode(SHEET_MODES.manual);
    setActiveMenuItemId(null);
    setSheetState({ item, kind: "edit" });
  }

  function closeSheet() {
    setSheetState({ kind: "closed" });
    setFrontText("");
    setBackText("");
  }

  async function handleCreateCard() {
    if (!frontText.trim() || !backText.trim()) {
      Alert.alert(
        CARD_SERVICE_TEXT.shared.inputRequiredTitle,
        CARD_SERVICE_TEXT.detail.updateRequiredHint
      );
      return;
    }
    try {
      await createMutation.mutateAsync({
        backText: backText.trim(),
        frontText: frontText.trim(),
      });
      closeSheet();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.detail.createErrorMessage;
      Alert.alert(CARD_SERVICE_TEXT.state.errorTitle, message);
    }
  }

  async function handleBulkCreateCards() {
    try {
      await bulkCreateMutation.mutateAsync();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.detail.createErrorMessage;
      Alert.alert(CARD_SERVICE_TEXT.state.errorTitle, message);
    }
  }

  async function handleUpdateCard() {
    if (sheetState.kind !== "edit") {
      return;
    }
    if (!frontText.trim() || !backText.trim()) {
      Alert.alert(
        CARD_SERVICE_TEXT.shared.inputRequiredTitle,
        CARD_SERVICE_TEXT.detail.updateRequiredHint
      );
      return;
    }
    try {
      await updateMutation.mutateAsync({
        backText: backText.trim(),
        frontText: frontText.trim(),
        itemId: sheetState.item.id,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.detail.updateErrorMessage;
      Alert.alert(CARD_SERVICE_TEXT.state.errorTitle, message);
    }
  }

  function handleDeleteCard(itemId: string) {
    Alert.alert(
      CARD_SERVICE_TEXT.detail.deleteConfirmTitle,
      CARD_SERVICE_TEXT.detail.deleteConfirmMessage,
      [
        { style: "cancel", text: CARD_SERVICE_TEXT.shared.closeLabel },
        {
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(itemId);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : CARD_SERVICE_TEXT.detail.deleteErrorMessage;
              Alert.alert(CARD_SERVICE_TEXT.state.errorTitle, message);
            }
          },
          style: "destructive",
          text: CARD_SERVICE_TEXT.shared.deleteLabel,
        },
      ]
    );
  }

  if (isBooting) {
    return (
      <View style={[styles.screen, styles.center]}>
        <StateBlock
          loading
          message={CARD_SERVICE_TEXT.state.bootLoadingMessage}
          title={CARD_SERVICE_TEXT.state.loadingTitle}
        />
      </View>
    );
  }

  const detail = detailQuery.data;
  const cardCount = detail?.items.length ?? detail?.deck.itemCount ?? 0;
  const canSubmitManual =
    frontText.trim().length > 0 &&
    backText.trim().length > 0 &&
    !createMutation.isPending &&
    !updateMutation.isPending;
  const canSubmitBulk =
    bulkText.trim().length > 0 && !bulkCreateMutation.isPending;

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
        <View style={styles.mobileHeader}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.headerIconButton}
          >
            <Text style={styles.headerIconText}>
              {CARD_SERVICE_TEXT.play.headerBackLabel}
            </Text>
          </Pressable>
          <View style={styles.headerTitleBox}>
            <Text numberOfLines={1} style={styles.deckTitle}>
              {detail?.deck.title ?? CARD_SERVICE_TEXT.detail.deckTitleFallback}
            </Text>
            <Text style={styles.deckMeta}>
              {`${getModeBadge(mode)} · ${CARD_SERVICE_TEXT.detail.metaCountLabel} ${cardCount}${CARD_SERVICE_TEXT.detail.metaSuffixCreatedAtLabel}`}
              {formatDate(detail?.deck.createdAt)}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={
              CARD_SERVICE_TEXT.detail.cardSettingsAccessibilityLabel
            }
            accessibilityRole="button"
            onPress={() =>
              Alert.alert(
                CARD_SERVICE_TEXT.detail.cardSettingsTitle,
                CARD_SERVICE_TEXT.detail.cardSettingsPreparingMessage
              )
            }
            style={styles.headerIconButton}
          >
            <Text style={styles.headerIconText}>⋮</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!detail || cardCount === 0}
          onPress={() => {
            if (!deckId) {
              return;
            }
            router.push(getCardServiceDeckPlayHref(deckId));
          }}
          style={({ pressed }) => [
            styles.playButton,
            (!detail || cardCount === 0) && styles.disabledButton,
            pressed && detail && cardCount > 0 ? styles.pressedButton : null,
          ]}
        >
          <Text style={styles.playButtonLabel}>
            {CARD_SERVICE_TEXT.detail.playButtonLabel}
          </Text>
        </Pressable>

        {detailQuery.isPending ? (
          <StateBlock
            loading
            message={CARD_SERVICE_TEXT.state.loading}
            title={CARD_SERVICE_TEXT.state.loadingTitle}
          />
        ) : detailQuery.isError ? (
          <StateBlock
            message={
              detailQuery.error instanceof Error
                ? detailQuery.error.message
                : CARD_SERVICE_TEXT.detail.errorMessage
            }
            title={CARD_SERVICE_TEXT.state.errorTitle}
          />
        ) : detail && detail.items.length === 0 ? (
          <StateBlock
            message={CARD_SERVICE_TEXT.detail.emptyMessage}
            title={CARD_SERVICE_TEXT.detail.emptyTitle}
          />
        ) : detail ? (
          <View style={styles.cardList}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>
                {CARD_SERVICE_TEXT.detail.itemLabel}
              </Text>
              <Text style={styles.sectionMeta}>
                {CARD_SERVICE_TEXT.detail.allCardsLabel} {detail.items.length}
              </Text>
            </View>
            {detail.items.map((item, index) => (
              <CompactCardRow
                index={index + 1}
                isBusy={updateMutation.isPending || deleteMutation.isPending}
                isMenuOpen={activeMenuItemId === item.id}
                item={item}
                key={item.id}
                onDelete={handleDeleteCard}
                onEdit={openEditSheet}
                onToggleMenu={() =>
                  setActiveMenuItemId((current) =>
                    current === item.id ? null : item.id
                  )
                }
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <Pressable
        accessibilityLabel={CARD_SERVICE_TEXT.detail.addCardAccessibilityLabel}
        accessibilityRole="button"
        onPress={openCreateSheet}
        style={styles.fab}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal
        animationType="slide"
        onRequestClose={closeSheet}
        transparent
        visible={sheetState.kind !== "closed"}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalRoot}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CARD_SERVICE_TEXT.shared.closeModalLabel}
            style={styles.backdrop}
            onPress={closeSheet}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTabs}>
              <Pressable
                accessibilityRole="button"
                disabled={sheetState.kind === "edit"}
                onPress={() => setSheetMode(SHEET_MODES.manual)}
                style={[
                  styles.sheetTab,
                  sheetMode === SHEET_MODES.manual && styles.sheetTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.sheetTabText,
                    sheetMode === SHEET_MODES.manual &&
                      styles.sheetTabTextActive,
                  ]}
                >
                  {CARD_SERVICE_TEXT.detail.sheetManualLabel}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={sheetState.kind === "edit"}
                onPress={() => setSheetMode(SHEET_MODES.bulk)}
                style={[
                  styles.sheetTab,
                  sheetMode === SHEET_MODES.bulk && styles.sheetTabActive,
                  sheetState.kind === "edit" && styles.disabledTab,
                ]}
              >
                <Text
                  style={[
                    styles.sheetTabText,
                    sheetMode === SHEET_MODES.bulk && styles.sheetTabTextActive,
                    sheetState.kind === "edit" && styles.disabledTabText,
                  ]}
                >
                  {CARD_SERVICE_TEXT.detail.sheetBulkLabel}
                </Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.sheetContent}
              keyboardShouldPersistTaps="handled"
            >
              {sheetState.kind === "edit" ||
              sheetMode === SHEET_MODES.manual ? (
                <>
                  <Text style={styles.sheetTitle}>
                    {sheetState.kind === "edit"
                      ? CARD_SERVICE_TEXT.detail.sheetEditTitle
                      : CARD_SERVICE_TEXT.detail.sheetCreateLabel}
                  </Text>
                  <LabeledTextarea
                    label={CARD_SERVICE_TEXT.detail.questionLabel}
                    maxLength={2000}
                    onChangeText={setFrontText}
                    placeholder={CARD_SERVICE_TEXT.detail.questionHint}
                    value={frontText}
                  />
                  <LabeledTextarea
                    label={CARD_SERVICE_TEXT.detail.answerLabel}
                    maxLength={2000}
                    onChangeText={setBackText}
                    placeholder={CARD_SERVICE_TEXT.detail.answerHint}
                    value={backText}
                  />
                  <Pressable
                    accessibilityRole="button"
                    disabled={!canSubmitManual}
                    onPress={
                      sheetState.kind === "edit"
                        ? handleUpdateCard
                        : handleCreateCard
                    }
                    style={({ pressed }) => [
                      styles.sheetPrimaryButton,
                      !canSubmitManual && styles.disabledButton,
                      pressed && canSubmitManual ? styles.pressedButton : null,
                    ]}
                  >
                    <Text style={styles.sheetPrimaryLabel}>
                      {sheetState.kind === "edit"
                        ? updateMutation.isPending
                          ? CARD_SERVICE_TEXT.detail.submitEditBusyLabel
                          : CARD_SERVICE_TEXT.detail.submitEditLabel
                        : createMutation.isPending
                          ? CARD_SERVICE_TEXT.detail.submitBusyLabel
                          : CARD_SERVICE_TEXT.detail.submitCreateLabel}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.sheetTitle}>
                    {CARD_SERVICE_TEXT.detail.sheetBulkLabel}
                  </Text>
                  <Text style={styles.sheetHelp}>
                    {CARD_SERVICE_TEXT.detail.bulkHelp}
                  </Text>
                  <TextInput
                    multiline
                    onChangeText={setBulkText}
                    placeholder={CARD_SERVICE_TEXT.detail.bulkPlaceholder}
                    placeholderTextColor={colors.textMuted}
                    style={[styles.textarea, styles.bulkTextarea]}
                    textAlignVertical="top"
                    value={bulkText}
                  />
                  <Pressable
                    accessibilityRole="button"
                    disabled={!canSubmitBulk}
                    onPress={handleBulkCreateCards}
                    style={({ pressed }) => [
                      styles.sheetPrimaryButton,
                      !canSubmitBulk && styles.disabledButton,
                      pressed && canSubmitBulk ? styles.pressedButton : null,
                    ]}
                  >
                    <Text style={styles.sheetPrimaryLabel}>
                      {bulkCreateMutation.isPending
                        ? CARD_SERVICE_TEXT.detail.submitBusyLabel
                        : CARD_SERVICE_TEXT.detail.bulkSaveLabel}
                    </Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

interface LabeledTextareaProps {
  label: string;
  maxLength: number;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

function LabeledTextarea({
  label,
  maxLength,
  onChangeText,
  placeholder,
  value,
}: LabeledTextareaProps) {
  return (
    <View style={styles.inputGroup}>
      <View style={styles.inputHeader}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Text style={styles.inputCounter}>
          {value.length}/{maxLength}
        </Text>
      </View>
      <TextInput
        maxLength={maxLength}
        multiline
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.textarea}
        textAlignVertical="top"
        value={value}
      />
    </View>
  );
}

interface CompactCardRowProps {
  index: number;
  isBusy: boolean;
  isMenuOpen: boolean;
  item: CardDeckItemDto;
  onDelete: (itemId: string) => void;
  onEdit: (item: CardDeckItemDto) => void;
  onToggleMenu: () => void;
}

function CompactCardRow({
  index,
  isBusy,
  isMenuOpen,
  item,
  onDelete,
  onEdit,
  onToggleMenu,
}: CompactCardRowProps) {
  const [isDeleteRevealed, setDeleteRevealed] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);

  function handlePressIn(event: GestureResponderEvent) {
    setStartX(event.nativeEvent.pageX);
  }

  function handlePressOut(event: GestureResponderEvent) {
    if (startX === null) {
      return;
    }

    const deltaX = event.nativeEvent.pageX - startX;
    setStartX(null);

    if (deltaX < -42) {
      setDeleteRevealed(true);
      return;
    }

    if (deltaX > 24) {
      setDeleteRevealed(false);
    }
  }

  return (
    <View style={styles.swipeShell}>
      <View style={styles.deleteRail}>
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonLabel}>
            {CARD_SERVICE_TEXT.shared.deleteLabel}
          </Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${CARD_SERVICE_TEXT.shared.openCardLabel}: ${item.frontText}`}
        onPress={() => {
          if (isDeleteRevealed) {
            setDeleteRevealed(false);
            return;
          }
          onEdit(item);
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.itemCard,
          isDeleteRevealed ? styles.itemCardRevealed : null,
        ]}
      >
        <View style={styles.indexBox}>
          <Text style={styles.indexText}>{index}</Text>
        </View>
        <View style={styles.itemContent}>
          <View style={styles.qaLine}>
            <Text style={styles.qaBadge}>
              {CARD_SERVICE_TEXT.detail.questionLabel}
            </Text>
            <Text style={styles.questionText}>{item.frontText}</Text>
          </View>
          <View style={styles.qaLine}>
            <Text style={styles.qaBadge}>
              {CARD_SERVICE_TEXT.detail.answerLabel}
            </Text>
            <Text style={styles.answerText}>{item.backText}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CARD_SERVICE_TEXT.shared.openCardMenuLabel}
          onPress={(event) => {
            event.stopPropagation();
            onToggleMenu();
          }}
          style={styles.moreButton}
        >
          <Text style={styles.moreButtonText}>⋮</Text>
        </Pressable>
      </Pressable>
      {isMenuOpen ? (
        <View style={styles.rowMenu}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CARD_SERVICE_TEXT.shared.editLabel}
            onPress={() => onEdit(item)}
            style={styles.rowMenuButton}
          >
            <Text style={styles.rowMenuText}>
              {CARD_SERVICE_TEXT.shared.editLabel}
            </Text>
          </Pressable>
          <Pressable
            disabled={isBusy}
            accessibilityLabel={CARD_SERVICE_TEXT.shared.deleteLabel}
            accessibilityRole="button"
            onPress={() => onDelete(item.id)}
            style={styles.rowMenuButton}
          >
            <Text style={styles.rowMenuDangerText}>
              {CARD_SERVICE_TEXT.shared.deleteLabel}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  answerText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  bulkTextarea: {
    minHeight: 210,
  },
  cardList: {
    gap: 12,
    marginTop: 22,
  },
  center: {
    gap: 14,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    padding: 24,
    paddingBottom: 110,
  },
  deckMeta: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 22,
    marginTop: 4,
    textAlign: "center",
  },
  deckTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 30,
    textAlign: "center",
  },
  deleteButton: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  deleteButtonLabel: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "900",
  },
  deleteRail: {
    backgroundColor: "#FFF0EF",
    bottom: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: 88,
  },
  disabledButton: {
    opacity: 0.45,
  },
  disabledTab: {
    opacity: 0.45,
  },
  disabledTabText: {
    color: colors.textMuted,
  },
  fab: {
    alignItems: "center",
    backgroundColor: colors.black,
    borderRadius: 32,
    bottom: 28,
    height: 64,
    justifyContent: "center",
    position: "absolute",
    right: 24,
    width: 64,
  },
  fabText: {
    color: colors.white,
    fontSize: 38,
    fontWeight: "300",
    lineHeight: 42,
  },
  headerIconButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerIconText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "300",
    lineHeight: 28,
  },
  headerTitleBox: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  indexBox: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRightColor: colors.border,
    borderRightWidth: 1,
    justifyContent: "center",
    width: 58,
  },
  indexText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
  },
  inputCounter: {
    color: colors.textMuted,
    fontSize: 12,
  },
  inputGroup: {
    gap: 10,
  },
  inputHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  itemCard: {
    alignItems: "stretch",
    backgroundColor: colors.white,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 92,
    overflow: "hidden",
    transform: [{ translateX: 0 }],
  },
  itemCardRevealed: {
    transform: [{ translateX: -88 }],
  },
  itemContent: {
    flex: 1,
    gap: 10,
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  mobileHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  moreButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  moreButtonText: {
    color: colors.textMuted,
    fontSize: 28,
    lineHeight: 30,
  },
  playButton: {
    alignItems: "center",
    backgroundColor: colors.black,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 34,
    minHeight: 56,
  },
  playButtonLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  pressedButton: {
    opacity: 0.84,
  },
  qaBadge: {
    borderColor: colors.borderStrong,
    borderRadius: 7,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  qaLine: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    minWidth: 0,
  },
  questionText: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  rowMenu: {
    alignSelf: "flex-end",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 8,
    overflow: "hidden",
  },
  rowMenuButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowMenuDangerText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "800",
  },
  rowMenuText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  sheetContent: {
    gap: 22,
    paddingBottom: 34,
    paddingTop: 26,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "#D4D4D4",
    borderRadius: 999,
    height: 6,
    width: 66,
  },
  sheetHelp: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  sheetPrimaryButton: {
    alignItems: "center",
    backgroundColor: colors.black,
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 52,
  },
  sheetPrimaryLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  sheetTab: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flex: 1,
    paddingBottom: 16,
    paddingTop: 18,
  },
  sheetTabActive: {
    borderBottomColor: colors.black,
    borderBottomWidth: 3,
  },
  sheetTabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  sheetTabTextActive: {
    color: colors.text,
  },
  sheetTabs: {
    flexDirection: "row",
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  swipeShell: {
    borderRadius: 12,
    overflow: "hidden",
  },
  textarea: {
    backgroundColor: colors.white,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 136,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
});
