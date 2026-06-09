import type {
  CardRoomCardDto,
  CardRoomMessageDto,
  CardRoomParticipantDto,
  CardRoomResult,
  CardRoomRole,
} from "@yeon/race-shared";
import {
  YeonActionButton as ActionButton,
  YeonButton,
  YeonText,
  YeonTextField as TextField,
  YeonView,
} from "@yeon/ui/native";

import { CARD_SERVICE_TEXT } from "../card-service-copy";
import { cardRoomScreenStyles as styles } from "./card-room-screen-styles";

const T = CARD_SERVICE_TEXT.rooms;

// idx-123: 표시 전 제어문자 제거 + 최대 길이 슬라이스.
function sanitizeChatText(text: string, maxLen: number): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, maxLen);
}

export function CardRoomHeader({
  cardCount,
  deckTitle,
  onLeave,
  title,
}: {
  cardCount: number;
  deckTitle: string;
  onLeave: () => void;
  title: string;
}) {
  return (
    <YeonView style={styles.header}>
      <YeonView style={styles.headerText}>
        <YeonText numberOfLines={1} style={styles.title}>
          {title}
        </YeonText>
        <YeonText numberOfLines={1} style={styles.subtitle}>
          {deckTitle} · {T.cardCount(cardCount)}
        </YeonText>
      </YeonView>
      <YeonButton
        accessibilityRole="button"
        aria-label={T.leaveLabel}
        onPress={onLeave}
        style={styles.leaveButton}
      >
        <YeonText style={styles.leaveText}>{T.leaveLabel}</YeonText>
      </YeonButton>
    </YeonView>
  );
}

export function CardRoomParticipantsSection({
  participants,
}: {
  participants: readonly CardRoomParticipantDto[];
}) {
  return (
    <YeonView style={styles.section}>
      <YeonText style={styles.sectionTitle}>
        {T.participantsLabel} ({participants.length})
      </YeonText>
      <YeonView style={styles.participantRow}>
        {participants.map((p) => (
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

export function WaitingControls({
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

export function FinishedCardRoomPanel({ onLeave }: { onLeave: () => void }) {
  return (
    <YeonView style={styles.finishedCard}>
      <YeonText style={styles.finishedTitle}>{T.finishedTitle}</YeonText>
      <YeonText style={styles.finishedMessage}>{T.finishedMessage}</YeonText>
      <ActionButton label={T.leaveLabel} onPress={onLeave} variant="dark" />
    </YeonView>
  );
}

type StudyCardSectionProps = {
  card: CardRoomCardDto;
  currentCardIndex: number;
  isChecker: boolean;
  isRevealed: boolean;
  onNext: () => void;
  onResult: (cardId: string, result: CardRoomResult) => void;
  onReveal: () => void;
  totalCards: number;
};

export function StudyCardSection({
  card,
  currentCardIndex,
  isChecker,
  isRevealed,
  onNext,
  onResult,
  onReveal,
  totalCards,
}: StudyCardSectionProps) {
  return (
    <YeonView style={styles.section}>
      <YeonText style={styles.progress}>
        {currentCardIndex + 1} / {totalCards}
      </YeonText>
      <YeonView style={styles.studyCard}>
        <YeonText style={styles.cardLabel}>{T.frontLabel}</YeonText>
        <YeonText style={styles.cardFront}>{card.frontText}</YeonText>
        {isChecker || isRevealed ? (
          <>
            <YeonView style={styles.cardDivider} />
            <YeonText style={styles.cardLabel}>{T.backLabel}</YeonText>
            <YeonText style={styles.cardBack}>{card.backText}</YeonText>
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
              onPress={() => onResult(card.id, "OK")}
            />
            <ResultButton
              label={T.resultHinted}
              onPress={() => onResult(card.id, "HINTED_OK")}
            />
            <ResultButton
              label={T.resultGiveUp}
              onPress={() => onResult(card.id, "GIVE_UP")}
            />
          </YeonView>
          <YeonView style={styles.advanceRow}>
            <ActionButton
              label={T.revealLabel}
              onPress={onReveal}
              style={styles.advanceButton}
              variant="secondary"
            />
            <ActionButton
              label={T.nextLabel}
              onPress={onNext}
              style={styles.advanceButton}
              variant="dark"
            />
          </YeonView>
        </YeonView>
      ) : null}
    </YeonView>
  );
}

type CardRoomChatSectionProps = {
  chatDraft: string;
  messages: readonly CardRoomMessageDto[];
  onChangeDraft: (value: string) => void;
  onSend: () => void;
};

export function CardRoomChatSection({
  chatDraft,
  messages,
  onChangeDraft,
  onSend,
}: CardRoomChatSectionProps) {
  return (
    <YeonView style={styles.section}>
      <YeonText style={styles.sectionTitle}>채팅</YeonText>
      <YeonView style={styles.chatList}>
        {messages.slice(-12).map((message) => (
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
        {messages.length === 0 ? (
          <YeonText style={styles.chatEmpty}>메시지가 없어요.</YeonText>
        ) : null}
      </YeonView>
      <YeonView style={styles.chatInputRow}>
        <YeonView style={styles.chatField}>
          {/* idx-122: 채팅 입력 maxLength 제한(API 계약 max 500) */}
          <TextField
            label=""
            maxLength={500}
            onChangeText={onChangeDraft}
            placeholder={T.chatPlaceholder}
            value={chatDraft}
          />
        </YeonView>
        <ActionButton
          disabled={chatDraft.trim().length === 0}
          label={T.chatSendLabel}
          onPress={onSend}
          style={styles.chatSend}
          variant="dark"
        />
      </YeonView>
    </YeonView>
  );
}
