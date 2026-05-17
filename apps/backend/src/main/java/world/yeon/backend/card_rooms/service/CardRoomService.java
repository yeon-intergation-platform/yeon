package world.yeon.backend.card_rooms.service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.card_rooms.domain.CardRoomError;
import world.yeon.backend.card_rooms.domain.CardRoomIdPrefix;
import world.yeon.backend.card_rooms.domain.CardRoomMessageType;
import world.yeon.backend.card_rooms.domain.CardRoomParticipantRole;
import world.yeon.backend.card_rooms.domain.CardRoomResult;
import world.yeon.backend.card_rooms.domain.CardRoomStatus;
import world.yeon.backend.card_rooms.domain.CardRoomSystemMessage;
import world.yeon.backend.card_rooms.domain.CardRoomTextRule;
import world.yeon.backend.card_rooms.domain.CardRoomVisibility;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomCardDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomDetailDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomListResponse;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomMessageDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomMessagesResponse;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomParticipantDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomParticipantResponse;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomResponse;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomResultDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomResultResponse;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomSummaryDto;
import world.yeon.backend.card_rooms.dto.CardRoomProfileRequest;
import world.yeon.backend.card_rooms.dto.CreateCardRoomMessageRequest;
import world.yeon.backend.card_rooms.dto.CreateCardRoomRequest;
import world.yeon.backend.card_rooms.dto.GuestCardSnapshotItemRequest;
import world.yeon.backend.card_rooms.dto.JoinCardRoomRequest;
import world.yeon.backend.card_rooms.dto.SubmitCardRoomResultRequest;
import world.yeon.backend.card_rooms.dto.UpdateCardRoomParticipantRequest;
import world.yeon.backend.card_rooms.repository.CardRoomRepository;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.CardRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.MessageRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.ParticipantRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.ResultRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.RoomRow;

@Service
public class CardRoomService {
  private static final Duration DEFAULT_STALE_AFTER = Duration.ofHours(6);

  private final CardRoomRepository repository;

  public CardRoomService(CardRoomRepository repository) {
    this.repository = repository;
  }

  public CardRoomListResponse listRooms() {
    return new CardRoomListResponse(repository.listPublicRooms().stream().map(this::toSummary).toList());
  }

  public CardRoomResponse getRoom(String roomId) {
    return new CardRoomResponse(detail(roomId), null);
  }

  @Transactional
  public CardRoomResponse createRoom(UUID userId, String guestId, CreateCardRoomRequest request) {
    var profile = normalizeProfile(request == null ? null : request.profile());
    String title = normalizeText(request == null ? null : request.title(), CardRoomTextRule.ROOM_TITLE);
    CardRoomVisibility visibility = normalizeVisibility(request.visibility());

    if ((request.deckId() == null || request.deckId().isBlank()) == (request.guestDeck() == null)) {
      throw new CardRoomServiceException(CardRoomError.INVALID_DECK_SOURCE);
    }

    String sourceDeckId = null;
    String deckTitle;
    List<GuestCardSnapshotItemRequest> items;
    if (request.deckId() != null && !request.deckId().isBlank()) {
      if (userId == null) {
        throw new CardRoomServiceException(CardRoomError.LOGIN_REQUIRED);
      }
      var deck = repository.findOwnedDeck(userId, request.deckId().trim());
      if (deck == null) {
        throw new CardRoomServiceException(CardRoomError.DECK_NOT_FOUND);
      }
      sourceDeckId = deck.publicId();
      deckTitle = deck.title();
      items = repository.listDeckItems(deck.internalId()).stream()
        .map((item) -> new GuestCardSnapshotItemRequest(item.frontText(), item.backText()))
        .toList();
    } else {
      if (guestId == null || guestId.isBlank()) {
        throw new CardRoomServiceException(CardRoomError.GUEST_ID_REQUIRED);
      }
      var guestDeck = request.guestDeck();
      deckTitle = normalizeText(guestDeck == null ? null : guestDeck.title(), CardRoomTextRule.DECK_TITLE);
      items = guestDeck == null || guestDeck.items() == null ? List.of() : guestDeck.items();
    }
    if (items.isEmpty()) {
      throw new CardRoomServiceException(CardRoomError.EMPTY_DECK);
    }

    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    var room = repository.insertRoom(newPublicId(CardRoomIdPrefix.ROOM), title, deckTitle, sourceDeckId, userId, guestId, visibility, now);
    int index = 0;
    for (var item : items) {
      String front = normalizeText(item.frontText(), CardRoomTextRule.CARD_FACE);
      String back = normalizeText(item.backText(), CardRoomTextRule.CARD_FACE);
      repository.insertCard(newPublicId(CardRoomIdPrefix.CARD), room.internalId(), index++, front, back);
    }
    var participant = repository.insertParticipant(newPublicId(CardRoomIdPrefix.PARTICIPANT), room.internalId(), userId, guestId, profile.nickname(), profile.characterId(), CardRoomParticipantRole.MEMORIZER, true, now);
    repository.insertMessage(newPublicId(CardRoomIdPrefix.MESSAGE), room.internalId(), null, CardRoomSystemMessage.ROOM_CREATED.text(), CardRoomMessageType.SYSTEM, now);
    return new CardRoomResponse(detail(room.publicId()), toParticipant(participant));
  }

  @Transactional
  public CardRoomParticipantResponse joinRoom(String roomId, UUID userId, String guestId, JoinCardRoomRequest request) {
    var room = requireRoom(roomId);
    ensureRoomOpen(room);
    var profile = normalizeProfile(request == null ? null : request.profile());
    var existing = repository.findActiveParticipantByIdentity(room.internalId(), userId, guestId);
    if (existing != null) {
      repository.updateParticipant(existing.internalId(), profile.nickname(), profile.characterId(), null, null);
      return new CardRoomParticipantResponse(toParticipant(requireParticipant(existing.publicId())), detail(roomId));
    }
    CardRoomParticipantRole role = normalizeRole(request == null ? null : request.role(), nextRole(room.internalId()));
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    var participant = repository.insertParticipant(newPublicId(CardRoomIdPrefix.PARTICIPANT), room.internalId(), userId, guestId, profile.nickname(), profile.characterId(), role, false, now);
    repository.insertMessage(newPublicId(CardRoomIdPrefix.MESSAGE), room.internalId(), null, CardRoomSystemMessage.participantJoined(profile.nickname()), CardRoomMessageType.SYSTEM, now);
    return new CardRoomParticipantResponse(toParticipant(participant), detail(roomId));
  }

  @Transactional
  public CardRoomParticipantResponse updateParticipant(String roomId, String participantId, UpdateCardRoomParticipantRequest request) {
    var room = requireRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    if (!CardRoomStatus.WAITING.matches(room.status()) && request != null && (request.role() != null || request.isReady() != null)) {
      throw new CardRoomServiceException(CardRoomError.ROOM_ALREADY_STARTED);
    }
    CardRoomProfileRequest profile = request == null ? null : request.profile();
    CardRoomParticipantRole role = request == null || request.role() == null
      ? null
      : normalizeRole(request.role(), CardRoomParticipantRole.fromNullable(participant.role(), CardRoomParticipantRole.MEMORIZER));

    repository.updateParticipant(
      participant.internalId(),
      profile == null ? null : normalizeText(profile.nickname(), CardRoomTextRule.NICKNAME),
      profile == null ? null : normalizeText(profile.characterId(), CardRoomTextRule.CHARACTER_ID),
      role,
      request == null ? null : request.isReady()
    );
    return new CardRoomParticipantResponse(toParticipant(requireParticipant(participantId)), detail(roomId));
  }

  @Transactional
  public CardRoomResponse startRoom(String roomId, String participantId) {
    var room = requireRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    requireHost(participant);
    if (!CardRoomStatus.WAITING.matches(room.status())) {
      throw new CardRoomServiceException(CardRoomError.ROOM_NOT_WAITING);
    }
    var participants = repository.listParticipants(room.internalId());
    boolean hasMemorizer = participants.stream().anyMatch((item) -> CardRoomParticipantRole.MEMORIZER.matches(item.role()));
    boolean hasChecker = participants.stream().anyMatch((item) -> CardRoomParticipantRole.CHECKER.matches(item.role()));
    if (!hasMemorizer || !hasChecker) {
      throw new CardRoomServiceException(CardRoomError.ROLE_REQUIRED);
    }
    if (participants.stream().anyMatch((item) -> !item.isReady())) {
      throw new CardRoomServiceException(CardRoomError.READY_REQUIRED);
    }
    if (repository.listCards(room.internalId()).isEmpty()) {
      throw new CardRoomServiceException(CardRoomError.EMPTY_DECK);
    }
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    repository.updateStatus(room.internalId(), CardRoomStatus.ANSWERING, 0, now);
    repository.insertMessage(newPublicId(CardRoomIdPrefix.MESSAGE), room.internalId(), null, CardRoomSystemMessage.STUDY_STARTED.text(), CardRoomMessageType.SYSTEM, now);
    return new CardRoomResponse(detail(roomId), null);
  }

  @Transactional
  public CardRoomResponse endRoom(String roomId, String participantId) {
    var room = requireRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    requireHost(participant);
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    repository.updateStatus(room.internalId(), CardRoomStatus.CLOSED, room.currentCardIndex(), now);
    repository.insertMessage(newPublicId(CardRoomIdPrefix.MESSAGE), room.internalId(), null, CardRoomSystemMessage.ROOM_CLOSED.text(), CardRoomMessageType.SYSTEM, now);
    return new CardRoomResponse(detail(roomId), null);
  }

  @Transactional
  public CardRoomResponse leaveRoom(String roomId, String participantId) {
    var room = requireRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    repository.leaveParticipant(participant.internalId(), now);
    if (repository.listParticipants(room.internalId()).isEmpty()) {
      repository.updateStatus(room.internalId(), CardRoomStatus.CLOSED, room.currentCardIndex(), now);
    }
    return new CardRoomResponse(detail(room.publicId()), null);
  }

  @Transactional
  public int cleanupStaleRooms(OffsetDateTime now, Duration staleAfter) {
    OffsetDateTime resolvedNow = now == null ? OffsetDateTime.now(ZoneOffset.UTC) : now;
    Duration resolvedStaleAfter = staleAfter == null || staleAfter.isNegative() || staleAfter.isZero()
      ? DEFAULT_STALE_AFTER
      : staleAfter;
    int closedEmptyRooms = repository.finishRoomsWithoutActiveParticipants(resolvedNow);
    int closedStaleRooms = repository.finishStaleRooms(resolvedNow.minus(resolvedStaleAfter), resolvedNow);
    return closedEmptyRooms + closedStaleRooms;
  }

  @Transactional
  public CardRoomResponse reveal(String roomId, String participantId) {
    var room = requireRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    if (!CardRoomParticipantRole.CHECKER.matches(participant.role())) {
      throw new CardRoomServiceException(CardRoomError.CHECKER_ONLY);
    }
    if (!CardRoomStatus.ANSWERING.matches(room.status())) {
      throw new CardRoomServiceException(CardRoomError.ROOM_NOT_ANSWERING);
    }
    repository.updateStatus(room.internalId(), CardRoomStatus.REVEALED, room.currentCardIndex(), OffsetDateTime.now(ZoneOffset.UTC));
    return new CardRoomResponse(detail(roomId), null);
  }

  @Transactional
  public CardRoomResponse next(String roomId, String participantId) {
    var room = requireRoom(roomId);
    requireParticipantInRoom(room, participantId);
    if (!CardRoomStatus.PASSED.matches(room.status()) && !CardRoomStatus.GIVEN_UP.matches(room.status()) && !CardRoomStatus.REVEALED.matches(room.status())) {
      throw new CardRoomServiceException(CardRoomError.CARD_NOT_RESOLVED);
    }
    int nextIndex = room.currentCardIndex() + 1;
    int cardCount = repository.listCards(room.internalId()).size();
    CardRoomStatus nextStatus = nextIndex >= cardCount ? CardRoomStatus.FINISHED : CardRoomStatus.ANSWERING;
    repository.updateStatus(room.internalId(), nextStatus, Math.min(nextIndex, Math.max(cardCount - 1, 0)), OffsetDateTime.now(ZoneOffset.UTC));
    return new CardRoomResponse(detail(roomId), null);
  }

  @Transactional
  public CardRoomMessagesResponse addMessage(String roomId, String participantId, CreateCardRoomMessageRequest request) {
    var room = requireRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    String content = normalizeText(request == null ? null : request.content(), CardRoomTextRule.CHAT_MESSAGE);
    repository.insertMessage(newPublicId(CardRoomIdPrefix.MESSAGE), room.internalId(), participant.internalId(), content, CardRoomMessageType.USER, OffsetDateTime.now(ZoneOffset.UTC));
    return new CardRoomMessagesResponse(detail(roomId).messages());
  }

  @Transactional
  public CardRoomResultResponse submitResult(String roomId, String participantId, SubmitCardRoomResultRequest request) {
    var room = requireRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    if (!CardRoomStatus.ANSWERING.matches(room.status()) && !CardRoomStatus.REVEALED.matches(room.status())) {
      throw new CardRoomServiceException(CardRoomError.ROOM_NOT_IN_PROGRESS);
    }
    var card = repository.findCard(request == null ? null : request.cardId());
    if (card == null || !card.roomId().equals(room.internalId())) {
      throw new CardRoomServiceException(CardRoomError.CARD_NOT_FOUND);
    }
    CardRoomResult result = normalizeResult(request.result());
    if (result.requiresChecker() && !CardRoomParticipantRole.CHECKER.matches(participant.role())) {
      throw new CardRoomServiceException(CardRoomError.CHECKER_ONLY);
    }
    if (result.requiresMemorizer() && !CardRoomParticipantRole.MEMORIZER.matches(participant.role())) {
      throw new CardRoomServiceException(CardRoomError.MEMORIZER_ONLY);
    }
    var saved = repository.insertResult(newPublicId(CardRoomIdPrefix.RESULT), room.internalId(), card.internalId(), participant.internalId(), result, OffsetDateTime.now(ZoneOffset.UTC));
    repository.updateStatus(room.internalId(), result.nextStatus(), room.currentCardIndex(), OffsetDateTime.now(ZoneOffset.UTC));
    return new CardRoomResultResponse(toResult(saved), detail(roomId));
  }

  private CardRoomDetailDto detail(String roomId) {
    var room = requireRoom(roomId);
    var cards = repository.listCards(room.internalId()).stream().map(this::toCard).toList();
    var participants = repository.listParticipants(room.internalId()).stream().map(this::toParticipant).toList();
    var messages = repository.listMessages(room.internalId()).stream().map(this::toMessage).toList();
    var results = repository.listResults(room.internalId()).stream().map(this::toResult).toList();
    return new CardRoomDetailDto(room.publicId(), room.title(), room.deckTitle(), room.hostLabel(), room.visibility(), room.status(), room.currentCardIndex(), cards.size(), room.memorizerCount(), room.checkerCount(), iso(room.createdAt()), iso(room.updatedAt()), participants, cards, messages, results);
  }

  private RoomRow requireRoom(String roomId) {
    var room = repository.findRoom(roomId);
    if (room == null) {
      throw new CardRoomServiceException(CardRoomError.ROOM_NOT_FOUND);
    }
    return room;
  }

  private ParticipantRow requireParticipant(String participantId) {
    var participant = repository.findParticipant(participantId);
    if (participant == null) {
      throw new CardRoomServiceException(CardRoomError.PARTICIPANT_NOT_FOUND);
    }
    return participant;
  }

  private ParticipantRow requireParticipantInRoom(RoomRow room, String participantId) {
    var participant = requireParticipant(participantId);
    if (!participant.roomId().equals(room.internalId())) {
      throw new CardRoomServiceException(CardRoomError.PARTICIPANT_ROOM_MISMATCH);
    }
    return participant;
  }

  private void requireHost(ParticipantRow participant) {
    if (!participant.isHost()) {
      throw new CardRoomServiceException(CardRoomError.HOST_ONLY);
    }
  }

  private void ensureRoomOpen(RoomRow room) {
    if (CardRoomStatus.CLOSED.matches(room.status())) {
      throw new CardRoomServiceException(CardRoomError.ROOM_CLOSED);
    }
  }

  private CardRoomParticipantRole nextRole(Long roomId) {
    boolean hasChecker = repository.listParticipants(roomId).stream()
      .anyMatch((participant) -> CardRoomParticipantRole.CHECKER.matches(participant.role()));
    return hasChecker ? CardRoomParticipantRole.MEMORIZER : CardRoomParticipantRole.CHECKER;
  }

  private CardRoomProfileRequest normalizeProfile(CardRoomProfileRequest profile) {
    if (profile == null) {
      throw new CardRoomServiceException(CardRoomError.PROFILE_REQUIRED);
    }
    return new CardRoomProfileRequest(
      normalizeText(profile.nickname(), CardRoomTextRule.NICKNAME),
      normalizeText(profile.characterId(), CardRoomTextRule.CHARACTER_ID)
    );
  }

  private String normalizeText(String value, CardRoomTextRule rule) {
    if (value == null || value.trim().isBlank()) {
      throw CardRoomServiceException.invalidText(rule.requiredMessage());
    }
    String trimmed = value.trim();
    return trimmed.substring(0, Math.min(trimmed.length(), rule.maxLength()));
  }

  private CardRoomVisibility normalizeVisibility(String value) {
    return CardRoomVisibility.fromNullable(value);
  }

  private CardRoomParticipantRole normalizeRole(String value, CardRoomParticipantRole fallback) {
    return CardRoomParticipantRole.fromNullable(value, fallback);
  }

  private CardRoomResult normalizeResult(String value) {
    return CardRoomResult.find(value).orElseThrow(() -> new CardRoomServiceException(CardRoomError.INVALID_RESULT));
  }

  private String newPublicId(CardRoomIdPrefix prefix) {
    return prefix.value() + "_" + UUID.randomUUID().toString().replace("-", "");
  }

  private String iso(OffsetDateTime value) {
    return value == null ? null : value.toString();
  }

  private CardRoomSummaryDto toSummary(RoomRow row) {
    return new CardRoomSummaryDto(row.publicId(), row.title(), row.deckTitle(), row.hostLabel(), row.visibility(), row.status(), row.currentCardIndex(), row.cardCount(), row.memorizerCount(), row.checkerCount(), iso(row.createdAt()), iso(row.updatedAt()));
  }

  private CardRoomParticipantDto toParticipant(ParticipantRow row) {
    return new CardRoomParticipantDto(row.publicId(), row.nickname(), row.characterId(), row.role(), row.isHost(), row.isReady(), iso(row.joinedAt()));
  }

  private CardRoomCardDto toCard(CardRow row) {
    return new CardRoomCardDto(row.publicId(), row.frontText(), row.backText(), row.orderIndex());
  }

  private CardRoomMessageDto toMessage(MessageRow row) {
    return new CardRoomMessageDto(row.publicId(), row.senderParticipantId(), row.senderNickname(), row.content(), row.messageType(), iso(row.createdAt()));
  }

  private CardRoomResultDto toResult(ResultRow row) {
    return new CardRoomResultDto(row.publicId(), row.cardPublicId(), row.participantPublicId(), row.result(), iso(row.createdAt()));
  }
}
