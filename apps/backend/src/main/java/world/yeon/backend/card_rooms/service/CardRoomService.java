package world.yeon.backend.card_rooms.service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.service.ExperienceService;
import world.yeon.backend.card_rooms.domain.CardRoomError;
import world.yeon.backend.card_rooms.domain.CardRoomIdPrefix;
import world.yeon.backend.card_rooms.domain.CardRoomMessageType;
import world.yeon.backend.card_rooms.domain.CardRoomParticipantRole;
import world.yeon.backend.card_rooms.domain.CardRoomResult;
import world.yeon.backend.card_rooms.domain.CardRoomStatus;
import world.yeon.backend.card_rooms.domain.CardRoomSystemMessage;
import world.yeon.backend.card_rooms.domain.CardRoomTextRule;
import world.yeon.backend.card_rooms.domain.CardRoomVisibility;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomDetailDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomListResponse;
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
import world.yeon.backend.card_rooms.repository.CardRoomRepository.ParticipantRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.ResultRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.RoomRow;

@Service
public class CardRoomService {
  private static final Duration DEFAULT_STALE_AFTER = Duration.ofHours(6);
  private static final int MAX_DECK_ITEMS = 200;

  private static final Logger log = LoggerFactory.getLogger(CardRoomService.class);

  private final CardRoomRepository repository;
  private final CardRoomParticipantTokenService participantTokenService;
  private final ExperienceService experienceService;

  public CardRoomService(CardRoomRepository repository, CardRoomParticipantTokenService participantTokenService, ExperienceService experienceService) {
    this.repository = repository;
    this.participantTokenService = participantTokenService;
    this.experienceService = experienceService;
  }

  public CardRoomListResponse listRooms() {
    return new CardRoomListResponse(repository.listPublicRooms().stream().map(this::toSummary).toList());
  }

  public CardRoomResponse getRoom(String roomId) {
    return new CardRoomResponse(detail(roomId), null, null);
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
    if (items.size() > MAX_DECK_ITEMS) {
      throw new CardRoomServiceException(400, "TOO_MANY_CARDS", "카드방에는 최대 " + MAX_DECK_ITEMS + "장까지 담을 수 있습니다.");
    }

    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    String resolvedSourceDeckId = sourceDeckId;
    var room = insertWithUniqueId(CardRoomIdPrefix.ROOM, (publicId) -> repository.insertRoom(publicId, title, deckTitle, resolvedSourceDeckId, userId, guestId, visibility, now));
    int index = 0;
    for (var item : items) {
      String front = normalizeText(item.frontText(), CardRoomTextRule.CARD_FACE);
      String back = normalizeText(item.backText(), CardRoomTextRule.CARD_FACE);
      int orderIndex = index++;
      insertWithUniqueId(CardRoomIdPrefix.CARD, (publicId) -> { repository.insertCard(publicId, room.internalId(), orderIndex, front, back); return null; });
    }
    var participant = insertWithUniqueId(CardRoomIdPrefix.PARTICIPANT, (publicId) -> repository.insertParticipant(publicId, room.internalId(), userId, guestId, profile.nickname(), profile.characterId(), CardRoomParticipantRole.MEMORIZER, true, now));
    repository.insertMessage(newPublicId(CardRoomIdPrefix.MESSAGE), room.internalId(), null, CardRoomSystemMessage.ROOM_CREATED.text(), CardRoomMessageType.SYSTEM, now);
    // 방장도 입장과 동일하게 소유 증명 토큰을 발급받아 재입장 없이 실시간에 연결한다.
    return new CardRoomResponse(detail(room.publicId()), toParticipant(participant), participantTokenService.issue(room.publicId(), participant.publicId()));
  }

  @Transactional
  public CardRoomParticipantResponse joinRoom(String roomId, UUID userId, String guestId, JoinCardRoomRequest request) {
    // 방 행 잠금으로 동일 식별자의 동시 입장 TOCTOU(중복 participant row)를 직렬화한다.
    var room = requireLockedRoom(roomId);
    ensureRoomOpen(room);
    var profile = normalizeProfile(request == null ? null : request.profile());
    var existing = repository.findActiveParticipantByIdentity(room.internalId(), userId, guestId);
    if (existing != null) {
      repository.updateParticipant(existing.internalId(), profile.nickname(), profile.characterId(), null, null);
      return participantResponse(toParticipant(requireParticipant(existing.publicId())), room.publicId());
    }
    CardRoomParticipantRole role = normalizeRole(request == null ? null : request.role(), nextRole(room.internalId()));
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    var participant = insertWithUniqueId(CardRoomIdPrefix.PARTICIPANT, (publicId) -> repository.insertParticipant(publicId, room.internalId(), userId, guestId, profile.nickname(), profile.characterId(), role, false, now));
    repository.insertMessage(newPublicId(CardRoomIdPrefix.MESSAGE), room.internalId(), null, CardRoomSystemMessage.participantJoined(profile.nickname()), CardRoomMessageType.SYSTEM, now);
    return participantResponse(toParticipant(participant), room.publicId());
  }

  @Transactional
  public CardRoomParticipantResponse updateParticipant(String roomId, String participantId, UUID callerUserId, String callerGuestId, String callerParticipantId, UpdateCardRoomParticipantRequest request) {
    var room = requireLockedRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    requireParticipantOwnership(participant, callerUserId, callerGuestId, callerParticipantId);
    // 정책(finding 27): 학습 시작 후(status != WAITING)에는 역할/준비 상태뿐 아니라
    // 프로필(닉네임/캐릭터)도 변경할 수 없게 막는다. 진행 중 닉네임이 바뀌면 시스템 메시지
    // ('님이 입장했습니다')와 결과 화면 표시가 도중에 흔들려 기록 일관성이 깨지기 때문이다.
    // 보수적 안전 기본값이며, 진행 중 프로필 변경을 허용해야 한다면 이 가드를 조정한다.
    boolean mutatesProfile = request != null && request.profile() != null
      && (request.profile().nickname() != null || request.profile().characterId() != null);
    if (!CardRoomStatus.WAITING.matches(room.status()) && request != null
      && (request.role() != null || request.isReady() != null || mutatesProfile)) {
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
    return participantResponse(toParticipant(requireParticipant(participantId)), room.publicId());
  }

  @Transactional
  public CardRoomResponse startRoom(String roomId, String participantId) {
    var room = requireLockedRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    requireHost(participant);
    if (!CardRoomStatus.WAITING.matches(room.status())) {
      throw new CardRoomServiceException(CardRoomError.ROOM_NOT_WAITING);
    }
    var participants = repository.listParticipants(room.internalId());
    // finding 21: 모든 활성 참가자가 유효 역할(외우는/봐주는)을 가져야 한다. 미배정(UNASSIGNED)이 있으면 막는다.
    if (participants.stream().anyMatch((item) -> !CardRoomParticipantRole.fromNullable(item.role(), CardRoomParticipantRole.UNASSIGNED).isAssigned())) {
      throw new CardRoomServiceException(CardRoomError.ROLE_UNASSIGNED);
    }
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
    repository.updateStatus(room.internalId(), CardRoomStatus.IN_PROGRESS, 0, false, now);
    repository.insertMessage(newPublicId(CardRoomIdPrefix.MESSAGE), room.internalId(), null, CardRoomSystemMessage.STUDY_STARTED.text(), CardRoomMessageType.SYSTEM, now);
    return new CardRoomResponse(detail(roomId), null, null);
  }

  @Transactional
  public CardRoomResponse endRoom(String roomId, String participantId) {
    var room = requireLockedRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    requireHost(participant);
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    repository.updateStatus(room.internalId(), CardRoomStatus.CLOSED, room.currentCardIndex(), room.currentCardRevealed(), now);
    repository.insertMessage(newPublicId(CardRoomIdPrefix.MESSAGE), room.internalId(), null, CardRoomSystemMessage.ROOM_CLOSED.text(), CardRoomMessageType.SYSTEM, now);
    return new CardRoomResponse(detail(roomId), null, null);
  }

  @Transactional
  public CardRoomResponse leaveRoom(String roomId, String participantId, UUID callerUserId, String callerGuestId, String callerParticipantId) {
    var room = requireLockedRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    // race-server(내부 신뢰 호출)는 게스트/유저 식별자 없이 HMAC 검증된 X-Yeon-Participant-Id로 본인을 증명한다.
    // 이 인자가 없으면 정상 퇴장이 모두 막혀 좀비 방이 된다(updateParticipant와 동일한 신뢰 경계).
    requireParticipantOwnership(participant, callerUserId, callerGuestId, callerParticipantId);
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    repository.leaveParticipant(participant.internalId(), now);
    var remaining = repository.listParticipants(room.internalId());
    if (remaining.isEmpty()) {
      repository.updateStatus(room.internalId(), CardRoomStatus.CLOSED, room.currentCardIndex(), room.currentCardRevealed(), now);
    } else if (participant.isHost() && remaining.stream().noneMatch(ParticipantRow::isHost)) {
      // 호스트가 떠나면 남은 활성 참가자 중 최초 입장자에게 호스트를 승계해 방이 진행 불가로 고착되지 않게 한다.
      var heir = repository.findEarliestActiveParticipant(room.internalId());
      if (heir != null) {
        repository.assignHost(heir.internalId());
        rebalanceRolesAfterHostSuccession(room, remaining, heir);
      }
    }
    return new CardRoomResponse(detail(room.publicId()), null, null);
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
    var room = requireLockedRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    ensureRoomActive(room);
    if (!CardRoomParticipantRole.CHECKER.matches(participant.role())) {
      throw new CardRoomServiceException(CardRoomError.CHECKER_ONLY);
    }
    if (!CardRoomStatus.IN_PROGRESS.matches(room.status())) {
      throw new CardRoomServiceException(CardRoomError.ROOM_NOT_IN_PROGRESS);
    }
    // finding 20: 방 status는 IN_PROGRESS를 유지하고 현재 카드의 공개 플래그만 set한다.
    repository.updateCurrentCardRevealed(room.internalId(), true, OffsetDateTime.now(ZoneOffset.UTC));
    return new CardRoomResponse(detail(roomId), null, null);
  }

  @Transactional
  public CardRoomResponse next(String roomId, String participantId) {
    var room = requireLockedRoom(roomId);
    requireParticipantInRoom(room, participantId);
    ensureRoomActive(room);
    if (!CardRoomStatus.IN_PROGRESS.matches(room.status())) {
      throw new CardRoomServiceException(CardRoomError.ROOM_NOT_IN_PROGRESS);
    }
    // finding 20: '현재 카드 resolved' 판정을 방 status가 아니라 card_room_results의
    // (room_id, current_card_id) 결과 존재 여부로 직접 한다. 다른 카드의 결과로는 통과하지 못한다.
    var cards = repository.listCards(room.internalId());
    var currentCard = cards.stream()
      .filter((card) -> card.orderIndex() == room.currentCardIndex())
      .findFirst()
      .orElse(null);
    if (currentCard == null || !repository.existsResultForCard(room.internalId(), currentCard.internalId())) {
      throw new CardRoomServiceException(CardRoomError.CARD_NOT_RESOLVED);
    }
    int nextIndex = room.currentCardIndex() + 1;
    int cardCount = cards.size();
    boolean isLastCard = nextIndex >= cardCount;
    CardRoomStatus nextStatus = isLastCard ? CardRoomStatus.FINISHED : CardRoomStatus.IN_PROGRESS;
    // 다음 카드로 진입하면 공개 플래그를 리셋한다. 종료 시에는 마지막 카드 인덱스에 고정한다.
    repository.updateStatus(room.internalId(), nextStatus, Math.min(nextIndex, Math.max(cardCount - 1, 0)), false, OffsetDateTime.now(ZoneOffset.UTC));
    if (isLastCard) {
      awardCardRoomFinished(room);
    }
    return new CardRoomResponse(detail(roomId), null, null);
  }

  // 카드방이 FINISHED로 전이될 때 활성 참가자 중 로그인 유저에게 경험치를 적립한다.
  // 멱등 키는 roomPublicId라 중복 next 호출이나 재시도에도 유저당 1회만 적립된다.
  // 적립 실패가 방 종료(이미 커밋된 status 전이)를 깨지 않도록 참가자별로 try/catch한다.
  private void awardCardRoomFinished(RoomRow room) {
    for (var participant : repository.listParticipants(room.internalId())) {
      if (participant.userId() == null) {
        continue; // 게스트 참가자는 적립 대상이 아니다.
      }
      try {
        experienceService.award(participant.userId(), ExperienceActivity.CARD_ROOM_FINISHED, room.publicId());
      } catch (RuntimeException error) {
        log.warn("카드방 완료 경험치 적립에 실패했습니다(방 종료는 정상). userId={}, roomId={}", participant.userId(), room.publicId(), error);
      }
    }
  }

  @Transactional
  public CardRoomMessagesResponse addMessage(String roomId, String participantId, CreateCardRoomMessageRequest request) {
    var room = requireLockedRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    ensureRoomOpen(room);
    String content = normalizeText(request == null ? null : request.content(), CardRoomTextRule.CHAT_MESSAGE);
    repository.insertMessage(newPublicId(CardRoomIdPrefix.MESSAGE), room.internalId(), participant.internalId(), content, CardRoomMessageType.USER, OffsetDateTime.now(ZoneOffset.UTC));
    // finding 23: 메시지 추가는 방 row(status/count)를 바꾸지 않으므로 이미 잠근 RoomRow를 재사용해 findRoom 중복을 없앤다.
    return new CardRoomMessagesResponse(detail(room).messages());
  }

  @Transactional
  public CardRoomResultResponse submitResult(String roomId, String participantId, SubmitCardRoomResultRequest request) {
    var room = requireLockedRoom(roomId);
    var participant = requireParticipantInRoom(room, participantId);
    ensureRoomActive(room);
    if (!CardRoomStatus.IN_PROGRESS.matches(room.status())) {
      throw new CardRoomServiceException(CardRoomError.ROOM_NOT_IN_PROGRESS);
    }
    // 카드 조회를 방 스코프로 일원화해 다른 방 카드 publicId 탐색을 차단한다.
    var card = repository.findCardInRoom(room.internalId(), request == null ? null : request.cardId());
    if (card == null) {
      throw new CardRoomServiceException(CardRoomError.CARD_NOT_FOUND);
    }
    // 클라이언트가 보낸 cardId가 실제 진행 중인 현재 카드와 일치하는지 검증해 임의 카드 결과 주입을 막는다.
    if (card.orderIndex() != room.currentCardIndex()) {
      throw new CardRoomServiceException(CardRoomError.CARD_NOT_RESOLVED);
    }
    // 같은 카드에 대한 결과 중복 제출을 차단한다(이미 확정된 카드).
    if (repository.existsResultForCard(room.internalId(), card.internalId())) {
      throw new CardRoomServiceException(CardRoomError.CARD_NOT_RESOLVED);
    }
    CardRoomResult result = normalizeResult(request.result());
    if (result.requiresChecker() && !CardRoomParticipantRole.CHECKER.matches(participant.role())) {
      throw new CardRoomServiceException(CardRoomError.CHECKER_ONLY);
    }
    if (result.requiresMemorizer() && !CardRoomParticipantRole.MEMORIZER.matches(participant.role())) {
      throw new CardRoomServiceException(CardRoomError.MEMORIZER_ONLY);
    }
    // finding 20: 결과는 card_room_results에만 기록한다. 방 status는 IN_PROGRESS를 유지하고
    // 카드 단위 진행 상태는 detail에서 (room_id, current_card_id)로 다시 노출한다.
    var saved = repository.insertResult(newPublicId(CardRoomIdPrefix.RESULT), room.internalId(), card.internalId(), participant.internalId(), result, OffsetDateTime.now(ZoneOffset.UTC));
    return new CardRoomResultResponse(toResult(saved), detail(roomId));
  }

  // 입장/참가자 갱신 응답에 (roomId, participantId)로 묶인 소유 증명 토큰을 함께 발급한다.
  // race-server는 이 토큰을 검증해 임의 participantId 가장(finding 166)을 차단한다.
  private CardRoomParticipantResponse participantResponse(CardRoomParticipantDto participant, String roomId) {
    return new CardRoomParticipantResponse(participant, detail(roomId), participantTokenService.issue(roomId, participant.id()));
  }

  private CardRoomDetailDto detail(String roomId) {
    return detail(requireRoom(roomId));
  }

  // finding 23(n+1): mutation 경로는 requireLockedRoom으로 이미 RoomRow를 갖고 있으므로
  // detail이 findRoom을 또 호출하지 않도록 RoomRow를 받는 오버로드로 중복 조회를 제거한다.
  private CardRoomDetailDto detail(RoomRow room) {
    var cards = repository.listCards(room.internalId());
    var participants = repository.listParticipants(room.internalId());
    var messages = repository.listMessages(room.internalId());
    var results = repository.listResults(room.internalId());
    // finding 20: 현재 카드의 결과(resolved 판정)는 방 status가 아니라 (room_id, current_card_id)로 직접 조회한다.
    var currentCard = cards.stream().filter((card) -> card.orderIndex() == room.currentCardIndex()).findFirst().orElse(null);
    String currentCardResult = currentCard == null ? null : repository.findResultValueForCard(room.internalId(), currentCard.internalId());
    return CardRoomDtoAssembler.toDetail(room, participants, cards, messages, results, currentCardResult);
  }

  private RoomRow requireRoom(String roomId) {
    var room = repository.findRoom(roomId);
    if (room == null) {
      throw new CardRoomServiceException(CardRoomError.ROOM_NOT_FOUND);
    }
    return room;
  }

  // 상태 전이/입장처럼 read-modify-write가 있는 경로는 방 행을 잠근 뒤 최신 상태를 다시 읽어
  // 동시 요청이 같은 status/current_card_index를 보고 덮어쓰는 race를 막는다.
  private RoomRow requireLockedRoom(String roomId) {
    var room = requireRoom(roomId);
    repository.lockRoom(room.internalId());
    return requireRoom(roomId);
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

  // finding 165(IDOR): participantId(publicId)는 detail 응답에 모든 참가자에게 공개되므로
  // 비밀 토큰이 아니다. 따라서 참가자 변이/퇴장은 '참가자가 방에 있는지'뿐 아니라
  // 호출자(X-Yeon-User-Id/X-Yeon-Guest-Id)가 그 participant의 실제 소유자인지까지 검증해야
  // 같은 방의 악의적 사용자가 다른 참가자의 publicId로 역할 변경·강제 퇴장하는 것을 막는다.
  // 로그인 사용자는 user_id, 게스트는 guest_id로 소유권을 판정한다.
  private void requireParticipantOwnership(ParticipantRow participant, UUID callerUserId, String callerGuestId) {
    requireParticipantOwnership(participant, callerUserId, callerGuestId, null);
  }

  private void requireParticipantOwnership(ParticipantRow participant, UUID callerUserId, String callerGuestId, String callerParticipantId) {
    if (callerUserId != null && callerUserId.equals(participant.userId())) {
      return;
    }
    if (callerGuestId != null && !callerGuestId.isBlank()
      && callerGuestId.equals(participant.guestId())) {
      return;
    }
    // race-server(내부 신뢰 호출)는 게스트 식별자 대신 X-Yeon-Participant-Id로 본인을 증명한다.
    // race-server는 WS 입장 시 (roomId, participantId) HMAC 토큰을 이미 검증했고, 이 엔드포인트는
    // 내부 토큰 필터로 보호되므로, 헤더 participantId가 대상과 일치하면 소유로 인정한다.
    if (callerParticipantId != null && !callerParticipantId.isBlank()
      && callerParticipantId.equals(participant.publicId())) {
      return;
    }
    throw new CardRoomServiceException(CardRoomError.PARTICIPANT_NOT_OWNED);
  }

  private void requireHost(ParticipantRow participant) {
    if (!participant.isHost()) {
      throw new CardRoomServiceException(CardRoomError.HOST_ONLY);
    }
  }

  // finding(#5): 호스트가 떠나며 필수 역할(외우는/봐주는) 한쪽이 사라지면, WAITING 방이
  // 시작 불가로 고착될 수 있다(startRoom은 memorizer·checker 둘 다 요구). 입장 시 자동 역할
  // 배정(nextRole)과 동일하게, 승계받은 새 호스트에게 빠진 역할을 부여해 방을 다시 시작 가능
  // 상태로 되돌린다. 활성 2인 이상에서만 적용한다 — 1인 방은 본질적으로 두 역할을 동시에 채울
  // 수 없으므로 새 입장자를 기다린다. WAITING이 아닌 방(이미 시작/종료)은 건드리지 않는다.
  // remaining은 역할 재배정 전 스냅샷이라 '무엇이 빠졌는지' 판정에 그대로 쓴다.
  private void rebalanceRolesAfterHostSuccession(RoomRow room, List<ParticipantRow> remaining, ParticipantRow heir) {
    if (!CardRoomStatus.WAITING.matches(room.status()) || remaining.size() < 2) {
      return;
    }
    boolean hasMemorizer = remaining.stream().anyMatch((item) -> CardRoomParticipantRole.MEMORIZER.matches(item.role()));
    boolean hasChecker = remaining.stream().anyMatch((item) -> CardRoomParticipantRole.CHECKER.matches(item.role()));
    CardRoomParticipantRole missingRole = !hasMemorizer
      ? CardRoomParticipantRole.MEMORIZER
      : (!hasChecker ? CardRoomParticipantRole.CHECKER : null);
    if (missingRole == null) {
      return;
    }
    repository.updateParticipant(heir.internalId(), null, null, missingRole, null);
  }

  private void ensureRoomOpen(RoomRow room) {
    if (CardRoomStatus.CLOSED.matches(room.status())) {
      throw new CardRoomServiceException(CardRoomError.ROOM_CLOSED);
    }
  }

  // 진행 계열 전이(reveal/next/submitResult)는 종료된 방을 먼저 걸러 '이미 종료됨'을 명확히 알린다.
  private void ensureRoomActive(RoomRow room) {
    if (CardRoomStatus.CLOSED.matches(room.status()) || CardRoomStatus.FINISHED.matches(room.status())) {
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
    // 길이 초과를 조용히 잘라내지 않고 명시적 검증 에러로 알린다(코드포인트 기준).
    if (trimmed.codePointCount(0, trimmed.length()) > rule.maxLength()) {
      throw CardRoomServiceException.invalidText(rule.requiredMessage());
    }
    return trimmed;
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

  // public_id는 UUID 기반이라 충돌 확률은 무시할 수준이지만, 이론상 충돌(또는 재실행)로 인한
  // unique 제약 위반을 500으로 노출하지 않도록 새 public_id로 몇 번 재시도한다.
  // 재시도를 모두 소진하면 다른 카드방 에러와 동일하게 일관된 에러 코드로 변환한다.
  private static final int MAX_PUBLIC_ID_ATTEMPTS = 5;

  private <T> T insertWithUniqueId(CardRoomIdPrefix prefix, Function<String, T> insert) {
    for (int attempt = 0; attempt < MAX_PUBLIC_ID_ATTEMPTS; attempt++) {
      try {
        return insert.apply(newPublicId(prefix));
      } catch (DuplicateKeyException ignored) {
        // public_id 충돌: 다음 시도에서 새 UUID 기반 id로 재생성한다.
      }
    }
    throw new CardRoomServiceException(409, "PUBLIC_ID_CONFLICT", "카드방 식별자 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }

  private CardRoomSummaryDto toSummary(RoomRow row) {
    return CardRoomDtoAssembler.toSummary(row);
  }

  private CardRoomParticipantDto toParticipant(ParticipantRow row) {
    return CardRoomDtoAssembler.toParticipant(row);
  }

  private CardRoomResultDto toResult(ResultRow row) {
    return CardRoomDtoAssembler.toResult(row);
  }
}
