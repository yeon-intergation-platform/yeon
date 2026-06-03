import type { CardRoomRole } from "@yeon/race-shared";
import { useYeonRouter as useRouter } from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonButton,
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
  YeonStateBlock as StateBlock,
  YeonText,
  YeonTextField as TextField,
  YeonView,
  createYeonStyleSheet,
  showYeonAlert,
  yeonMobileAppColors,
} from "@yeon/ui/native";
import { useEffect, useState } from "react";
import { cardRoomApi } from "../../../services/card-rooms/client";
import {
  deleteCardRoomParticipantId,
  deleteCardRoomParticipantToken,
  readCardRoomParticipantId,
  readCardRoomParticipantToken,
  writeCardRoomParticipantId,
  writeCardRoomParticipantToken,
} from "../../../services/card-rooms/profile-storage";
import { CARD_SERVICE_TEXT } from "../card-service-copy";
import { useCardRoomConnection } from "./use-card-room-connection";
import { useCardRoomIdentity } from "./use-card-room-identity";

const T = CARD_SERVICE_TEXT.rooms;

// idx-123: 표시 전 제어문자 제거 + 최대 길이 슬라이스.
function sanitizeChatText(text: string, maxLen: number): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, maxLen);
}

type CardRoomScreenProps = { roomId: string };

export function CardRoomScreen({ roomId }: CardRoomScreenProps) {
  const router = useRouter();
  const { profile, guestId, loaded } = useCardRoomIdentity();
  const [participantId, setParticipantId] = useState<string | null>(null);
  // finding 166: race-server 입장 시 participantId 소유를 증명하는 토큰.
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [chatDraft, setChatDraft] = useState("");

  // 입장: 저장된 참가자 ID가 있으면 재사용, 없으면 REST join.
  useEffect(() => {
    if (!loaded || !profile || !guestId || participantId) return;
    let cancelled = false;
    void (async () => {
      const stored = await readCardRoomParticipantId(roomId);
      if (stored) {
        const storedToken = await readCardRoomParticipantToken(roomId);
        if (!cancelled) {
          setParticipantToken(storedToken);
          setParticipantId(stored);
        }
        return;
      }
      try {
        const response = await cardRoomApi.joinRoom(
          roomId,
          { profile },
          guestId
        );
        await writeCardRoomParticipantId(roomId, response.participant.id);
        const token = response.participantToken ?? null;
        if (token) {
          await writeCardRoomParticipantToken(roomId, token);
        } else {
          await deleteCardRoomParticipantToken(roomId);
        }
        if (!cancelled) {
          setParticipantToken(token);
          setParticipantId(response.participant.id);
        }
      } catch (error) {
        if (!cancelled) {
          setJoinError(
            error instanceof Error ? error.message : T.joinErrorTitle
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loaded, profile, guestId, participantId, roomId]);

  const connection = useCardRoomConnection(
    roomId,
    participantId,
    participantToken
  );
  const state = connection.state;

  // idx-112: stale participantId 복구 — 서버 participants에 내 ID가 없으면 저장된 ID를
  // 삭제하고 setParticipantId(null)로 REST join을 재시도(토큰도 함께 정리).
  useEffect(() => {
    if (!state || !participantId) return;
    const exists = state.participants.some((p) => p.id === participantId);
    if (exists) return;
    void deleteCardRoomParticipantId(roomId);
    void deleteCardRoomParticipantToken(roomId);
    setParticipantToken(null);
    setParticipantId(null);
  }, [state, participantId, roomId]);

  // idx-113: 퇴장 시 서버에 LEAVE 이벤트 전송 + 저장된 participantId/토큰 정리.
  function handleLeave() {
    if (participantId) {
      connection.sendLeave();
      void deleteCardRoomParticipantId(roomId);
      void deleteCardRoomParticipantToken(roomId);
    }
    router.back();
  }

  if (joinError) {
    // idx-116: 재시도 버튼 제공 — joinError를 null로 리셋해 effect를 재실행.
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock message={joinError} title={T.joinErrorTitle} />
        <ActionButton
          label={T.retryLabel}
          onPress={() => setJoinError(null)}
          variant="dark"
        />
      </MobileScreen>
    );
  }

  if (connection.connectionState === "error" && connection.error) {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock message={connection.error} title={T.connectionErrorTitle} />
      </MobileScreen>
    );
  }

  // idx-115: 연결 끊김 상태를 사용자에게 알리는 UI 추가.
  if (connection.connectionState === "disconnected") {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock
          message={T.disconnectedMessage}
          title={T.connectionErrorTitle}
        />
        <ActionButton
          label={T.leaveLabel}
          onPress={handleLeave}
          variant="dark"
        />
      </MobileScreen>
    );
  }

  if (!state) {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock loading message={T.connecting} title={T.lobbyTitle} />
      </MobileScreen>
    );
  }

  const me = state.participants.find((p) => p.id === participantId) ?? null;
  const myRole = me?.role ?? "MEMORIZER";
  const isHost = me?.isHost ?? false;
  const currentCard = state.cards[state.currentCardIndex] ?? null;
  const isChecker = myRole === "CHECKER";
  const isWaiting = state.status === "waiting";
  const isFinished = state.status === "finished" || state.status === "closed";
  const isRevealed =
    state.status === "revealed" ||
    state.status === "passed" ||
    state.status === "given_up";
  // idx-126: web canStart와 동등한 조건으로 클라이언트 검증(서버 에러 의존 최소화).
  const canStart = Boolean(
    isWaiting &&
    isHost &&
    state.cards.length > 0 &&
    state.participants.some((p) => p.role === "MEMORIZER") &&
    state.participants.some((p) => p.role === "CHECKER") &&
    state.participants.every((p) => p.isReady)
  );

  function sendChat() {
    const content = chatDraft.trim();
    if (!content) return;
    connection.sendChat(content);
    setChatDraft("");
  }

  function chooseRole(role: CardRoomRole) {
    connection.sendRole(role);
  }

  function handleStart() {
    // idx-126: 호스트 여부 + 역할/준비/카드 조건 클라이언트 검증.
    if (!isHost) {
      showYeonAlert(T.waitingTitle, T.hostOnlyStart);
      return;
    }
    if (!canStart) {
      showYeonAlert(T.waitingTitle, T.startNotReadyHint);
      return;
    }
    connection.sendStart();
  }

  return (
    <MobileScreen contentVariant="card" safeAreaEdges={["top"]}>
      <FormStack gap="roomy">
        {/* 헤더 */}
        <YeonView style={styles.header}>
          <YeonView style={styles.headerText}>
            <YeonText numberOfLines={1} style={styles.title}>
              {state.title}
            </YeonText>
            <YeonText numberOfLines={1} style={styles.subtitle}>
              {state.deckTitle} · {T.cardCount(state.cards.length)}
            </YeonText>
          </YeonView>
          <YeonButton
            accessibilityRole="button"
            aria-label={T.leaveLabel}
            onPress={handleLeave}
            style={styles.leaveButton}
          >
            <YeonText style={styles.leaveText}>{T.leaveLabel}</YeonText>
          </YeonButton>
        </YeonView>

        {/* 참가자 */}
        <YeonView style={styles.section}>
          <YeonText style={styles.sectionTitle}>
            {T.participantsLabel} ({state.participants.length})
          </YeonText>
          <YeonView style={styles.participantRow}>
            {state.participants.map((p) => (
              <YeonView key={p.id} style={styles.participantChip}>
                <YeonText style={styles.participantName}>
                  {p.nickname}
                  {p.isHost ? " 👑" : ""}
                </YeonText>
                <YeonText style={styles.participantRole}>
                  {p.role === "MEMORIZER" ? T.roleMemorizer : T.roleChecker}
                  {p.isReady ? " ✓" : ""}
                </YeonText>
              </YeonView>
            ))}
          </YeonView>
        </YeonView>

        {isWaiting ? (
          <WaitingControls
            canStart={canStart}
            isReady={me?.isReady ?? false}
            isHost={isHost}
            myRole={myRole}
            onChooseRole={chooseRole}
            onReadyToggle={() => connection.sendReady(!(me?.isReady ?? false))}
            onStart={handleStart}
          />
        ) : isFinished ? (
          <YeonView style={styles.finishedCard}>
            <YeonText style={styles.finishedTitle}>{T.finishedTitle}</YeonText>
            <YeonText style={styles.finishedMessage}>
              {T.finishedMessage}
            </YeonText>
            <ActionButton
              label={T.leaveLabel}
              onPress={handleLeave}
              variant="dark"
            />
          </YeonView>
        ) : currentCard ? (
          <YeonView style={styles.section}>
            <YeonText style={styles.progress}>
              {state.currentCardIndex + 1} / {state.cards.length}
            </YeonText>
            <YeonView style={styles.studyCard}>
              <YeonText style={styles.cardLabel}>{T.frontLabel}</YeonText>
              <YeonText style={styles.cardFront}>
                {currentCard.frontText}
              </YeonText>
              {isChecker || isRevealed ? (
                <>
                  <YeonView style={styles.cardDivider} />
                  <YeonText style={styles.cardLabel}>{T.backLabel}</YeonText>
                  <YeonText style={styles.cardBack}>
                    {currentCard.backText}
                  </YeonText>
                </>
              ) : null}
            </YeonView>

            <YeonText style={styles.roleHint}>
              {isChecker ? T.checkerHint : T.memorizerHint}
            </YeonText>

            {isChecker ? (
              <YeonView style={styles.checkerControls}>
                <YeonView style={styles.resultRow}>
                  <ResultButton
                    label={T.resultOk}
                    onPress={() => connection.sendResult(currentCard.id, "OK")}
                  />
                  <ResultButton
                    label={T.resultHinted}
                    onPress={() =>
                      connection.sendResult(currentCard.id, "HINTED_OK")
                    }
                  />
                  <ResultButton
                    label={T.resultGiveUp}
                    onPress={() =>
                      connection.sendResult(currentCard.id, "GIVE_UP")
                    }
                  />
                </YeonView>
                <YeonView style={styles.advanceRow}>
                  <ActionButton
                    label={T.revealLabel}
                    onPress={connection.sendReveal}
                    style={styles.advanceButton}
                    variant="secondary"
                  />
                  <ActionButton
                    label={T.nextLabel}
                    onPress={connection.sendNext}
                    style={styles.advanceButton}
                    variant="dark"
                  />
                </YeonView>
              </YeonView>
            ) : null}
          </YeonView>
        ) : null}

        {/* 채팅 */}
        <YeonView style={styles.section}>
          <YeonText style={styles.sectionTitle}>채팅</YeonText>
          <YeonView style={styles.chatList}>
            {state.messages.slice(-12).map((message) => (
              <YeonText key={message.id} style={styles.chatLine}>
                {message.messageType === "system" ? (
                  <YeonText style={styles.chatSystem}>
                    {/* idx-123: 시스템 메시지 제어문자 정규화 */}
                    {sanitizeChatText(message.content, 500)}
                  </YeonText>
                ) : (
                  <YeonText>
                    <YeonText style={styles.chatSender}>
                      {/* idx-123: 닉네임 안전 길이로 슬라이스 + 제어문자 정규화 */}
                      {sanitizeChatText(message.senderNickname ?? "익명", 40)}
                    </YeonText>
                    {`  ${sanitizeChatText(message.content, 500)}`}
                  </YeonText>
                )}
              </YeonText>
            ))}
            {state.messages.length === 0 ? (
              <YeonText style={styles.chatEmpty}>메시지가 없어요.</YeonText>
            ) : null}
          </YeonView>
          <YeonView style={styles.chatInputRow}>
            <YeonView style={styles.chatField}>
              {/* idx-122: 채팅 입력 maxLength 제한(API 계약 max 500) */}
              <TextField
                label=""
                maxLength={500}
                onChangeText={setChatDraft}
                placeholder={T.chatPlaceholder}
                value={chatDraft}
              />
            </YeonView>
            <ActionButton
              disabled={chatDraft.trim().length === 0}
              label={T.chatSendLabel}
              onPress={sendChat}
              style={styles.chatSend}
              variant="dark"
            />
          </YeonView>
        </YeonView>
      </FormStack>
    </MobileScreen>
  );
}

type WaitingControlsProps = {
  myRole: CardRoomRole;
  isReady: boolean;
  isHost: boolean;
  canStart: boolean;
  onChooseRole: (role: CardRoomRole) => void;
  onReadyToggle: () => void;
  onStart: () => void;
};

function WaitingControls({
  myRole,
  isReady,
  isHost,
  canStart,
  onChooseRole,
  onReadyToggle,
  onStart,
}: WaitingControlsProps) {
  return (
    <YeonView style={styles.section}>
      <YeonText style={styles.sectionTitle}>{T.waitingTitle}</YeonText>
      <YeonView style={styles.roleRow}>
        {(["MEMORIZER", "CHECKER"] as const).map((role) => {
          const active = myRole === role;
          return (
            <YeonButton
              accessibilityRole="button"
              aria-label={
                role === "MEMORIZER" ? T.roleMemorizer : T.roleChecker
              }
              key={role}
              onPress={() => onChooseRole(role)}
              style={[styles.roleChip, active && styles.roleChipActive]}
            >
              <YeonText
                style={[styles.roleText, active && styles.roleTextActive]}
              >
                {role === "MEMORIZER" ? T.roleMemorizer : T.roleChecker}
              </YeonText>
            </YeonButton>
          );
        })}
      </YeonView>
      <ActionButton
        label={isReady ? T.unreadyLabel : T.readyLabel}
        onPress={onReadyToggle}
        variant={isReady ? "secondary" : "dark"}
      />
      {/* idx-126: 방장에게만 시작 버튼 표시, canStart 조건 만족 시만 활성화 */}
      {isHost ? (
        <ActionButton
          disabled={!canStart}
          label={T.startLabel}
          onPress={onStart}
          variant="dark"
        />
      ) : null}
    </YeonView>
  );
}

function ResultButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <YeonButton
      accessibilityRole="button"
      aria-label={label}
      onPress={onPress}
      style={styles.resultButton}
    >
      <YeonText style={styles.resultText}>{label}</YeonText>
    </YeonButton>
  );
}

const styles = createYeonStyleSheet({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 28,
    paddingTop: 4,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  leaveButton: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  leaveText: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  participantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  participantChip: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  participantName: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  participantRole: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
  },
  roleChip: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },
  roleChipActive: {
    backgroundColor: yeonMobileAppColors.text,
    borderColor: yeonMobileAppColors.text,
  },
  roleText: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  roleTextActive: {
    color: yeonMobileAppColors.surfaceStrong,
  },
  progress: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  studyCard: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 20,
  },
  cardLabel: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  cardFront: {
    color: yeonMobileAppColors.text,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  cardDivider: {
    backgroundColor: yeonMobileAppColors.border,
    height: 1,
    marginVertical: 8,
  },
  cardBack: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    lineHeight: 26,
  },
  roleHint: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  checkerControls: {
    gap: 10,
  },
  resultRow: {
    flexDirection: "row",
    gap: 8,
  },
  resultButton: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },
  resultText: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  advanceRow: {
    flexDirection: "row",
    gap: 8,
  },
  advanceButton: {
    flex: 1,
  },
  finishedCard: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 24,
  },
  finishedTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  finishedMessage: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    textAlign: "center",
  },
  chatList: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    minHeight: 80,
    padding: 12,
  },
  chatLine: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  chatSender: {
    color: yeonMobileAppColors.text,
    fontWeight: "700",
  },
  chatSystem: {
    color: yeonMobileAppColors.textMuted,
    fontStyle: "italic",
  },
  chatEmpty: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  chatInputRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  chatField: {
    flex: 1,
  },
  chatSend: {
    paddingHorizontal: 18,
  },
});
