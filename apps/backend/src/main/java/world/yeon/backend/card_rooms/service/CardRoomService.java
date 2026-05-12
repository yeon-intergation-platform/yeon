package world.yeon.backend.card_rooms.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.card_rooms.dto.*;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.*;
import world.yeon.backend.card_rooms.repository.CardRoomRepository;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.*;

@Service
public class CardRoomService {
  private final CardRoomRepository repository;
  public CardRoomService(CardRoomRepository repository) { this.repository = repository; }

  public CardRoomListResponse listRooms() {
    return new CardRoomListResponse(repository.listPublicRooms().stream().map(this::toSummary).toList());
  }

  public CardRoomResponse getRoom(String roomId) {
    return new CardRoomResponse(detail(roomId), null);
  }

  @Transactional
  public CardRoomResponse createRoom(UUID userId, String guestId, CreateCardRoomRequest request) {
    var profile = normalizeProfile(request == null ? null : request.profile());
    String title = normalizeText(request == null ? null : request.title(), 80, "방 제목을 입력해 주세요.");
    String visibility = normalizeVisibility(request.visibility());
    if ((request.deckId() == null || request.deckId().isBlank()) == (request.guestDeck() == null)) {
      throw new CardRoomServiceException(400, "INVALID_DECK_SOURCE", "덱 또는 게스트 덱 스냅샷 중 하나가 필요합니다.");
    }

    String sourceDeckId = null;
    String deckTitle;
    List<GuestCardSnapshotItemRequest> items;
    if (request.deckId() != null && !request.deckId().isBlank()) {
      if (userId == null) throw new CardRoomServiceException(401, "LOGIN_REQUIRED", "내 덱으로 카드방을 만들려면 로그인해 주세요.");
      var deck = repository.findOwnedDeck(userId, request.deckId().trim());
      if (deck == null) throw new CardRoomServiceException(404, "DECK_NOT_FOUND", "덱을 찾지 못했습니다.");
      sourceDeckId = deck.publicId();
      deckTitle = deck.title();
      items = repository.listDeckItems(deck.internalId()).stream().map(i -> new GuestCardSnapshotItemRequest(i.frontText(), i.backText())).toList();
    } else {
      if (guestId == null || guestId.isBlank()) throw new CardRoomServiceException(400, "GUEST_ID_REQUIRED", "게스트 식별자가 필요합니다.");
      var guestDeck = request.guestDeck();
      deckTitle = normalizeText(guestDeck == null ? null : guestDeck.title(), 120, "덱 제목을 입력해 주세요.");
      items = guestDeck == null || guestDeck.items() == null ? List.of() : guestDeck.items();
    }
    if (items.isEmpty()) throw new CardRoomServiceException(400, "EMPTY_DECK", "카드가 1장 이상 있는 덱이 필요합니다.");

    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    var room = repository.insertRoom(newPublicId("crm"), title, deckTitle, sourceDeckId, userId, guestId, visibility, now);
    int index = 0;
    for (var item : items) {
      String front = normalizeText(item.frontText(), 2000, "앞면과 뒷면을 모두 입력해 주세요.");
      String back = normalizeText(item.backText(), 2000, "앞면과 뒷면을 모두 입력해 주세요.");
      repository.insertCard(newPublicId("crc"), room.internalId(), index++, front, back);
    }
    var participant = repository.insertParticipant(newPublicId("crp"), room.internalId(), userId, guestId, profile.nickname(), profile.characterId(), "MEMORIZER", true, now);
    repository.insertMessage(newPublicId("crmmsg"), room.internalId(), null, "카드방이 만들어졌습니다.", "system", now);
    return new CardRoomResponse(detail(room.publicId()), toParticipant(participant));
  }

  @Transactional
  public CardRoomParticipantResponse joinRoom(String roomId, UUID userId, String guestId, JoinCardRoomRequest request) {
    var room = requireRoom(roomId);
    var profile = normalizeProfile(request == null ? null : request.profile());
    String role = normalizeRole(request == null ? null : request.role(), nextRole(room.internalId()));
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    var participant = repository.insertParticipant(newPublicId("crp"), room.internalId(), userId, guestId, profile.nickname(), profile.characterId(), role, false, now);
    repository.insertMessage(newPublicId("crmmsg"), room.internalId(), null, profile.nickname() + "님이 입장했습니다.", "system", now);
    return new CardRoomParticipantResponse(toParticipant(participant), detail(roomId));
  }

  @Transactional
  public CardRoomParticipantResponse updateParticipant(String roomId, String participantId, UpdateCardRoomParticipantRequest request) {
    requireRoom(roomId);
    var participant = requireParticipant(participantId);
    CardRoomProfileRequest profile = request == null ? null : request.profile();
    String role = request == null ? null : (request.role() == null ? null : normalizeRole(request.role(), participant.role()));
    repository.updateParticipant(participant.internalId(), profile == null ? null : normalizeText(profile.nickname(), 40, "닉네임을 입력해 주세요."), profile == null ? null : normalizeText(profile.characterId(), 80, "캐릭터를 선택해 주세요."), role, request == null ? null : request.isReady());
    return new CardRoomParticipantResponse(toParticipant(requireParticipant(participantId)), detail(roomId));
  }

  @Transactional
  public CardRoomResponse leaveRoom(String roomId, String participantId) {
    var room = requireRoom(roomId);
    var participant = requireParticipant(participantId);
    repository.leaveParticipant(participant.internalId(), OffsetDateTime.now(ZoneOffset.UTC));
    return new CardRoomResponse(detail(room.publicId()), null);
  }

  @Transactional
  public CardRoomResponse reveal(String roomId, String participantId) {
    var room = requireRoom(roomId);
    requireParticipant(participantId);
    repository.updateStatus(room.internalId(), "revealed", room.currentCardIndex(), OffsetDateTime.now(ZoneOffset.UTC));
    return new CardRoomResponse(detail(roomId), null);
  }

  @Transactional
  public CardRoomResponse next(String roomId, String participantId) {
    var room = requireRoom(roomId);
    requireParticipant(participantId);
    int nextIndex = room.currentCardIndex() + 1;
    int cardCount = repository.listCards(room.internalId()).size();
    String nextStatus = nextIndex >= cardCount ? "finished" : "answering";
    repository.updateStatus(room.internalId(), nextStatus, Math.min(nextIndex, Math.max(cardCount - 1, 0)), OffsetDateTime.now(ZoneOffset.UTC));
    return new CardRoomResponse(detail(roomId), null);
  }

  @Transactional
  public CardRoomMessagesResponse addMessage(String roomId, String participantId, CreateCardRoomMessageRequest request) {
    var room = requireRoom(roomId);
    var participant = requireParticipant(participantId);
    String content = normalizeText(request == null ? null : request.content(), 500, "메시지를 입력해 주세요.");
    repository.insertMessage(newPublicId("crmmsg"), room.internalId(), participant.internalId(), content, "user", OffsetDateTime.now(ZoneOffset.UTC));
    return new CardRoomMessagesResponse(detail(roomId).messages());
  }

  @Transactional
  public CardRoomResultResponse submitResult(String roomId, String participantId, SubmitCardRoomResultRequest request) {
    var room = requireRoom(roomId);
    var participant = requireParticipant(participantId);
    var card = repository.findCard(request == null ? null : request.cardId());
    if (card == null || !card.roomId().equals(room.internalId())) throw new CardRoomServiceException(404, "CARD_NOT_FOUND", "카드를 찾지 못했습니다.");
    String result = normalizeResult(request.result());
    if ("OK".equals(result) && !"CHECKER".equals(participant.role())) throw new CardRoomServiceException(403, "CHECKER_ONLY", "OK는 봐주는 사람만 확정할 수 있습니다.");
    if ("GIVE_UP".equals(result) && !"MEMORIZER".equals(participant.role())) throw new CardRoomServiceException(403, "MEMORIZER_ONLY", "포기는 외우는 사람만 할 수 있습니다.");
    var saved = repository.insertResult(newPublicId("crr"), room.internalId(), card.internalId(), participant.internalId(), result, OffsetDateTime.now(ZoneOffset.UTC));
    repository.updateStatus(room.internalId(), "OK".equals(result) || "HINTED_OK".equals(result) ? "passed" : "given_up", room.currentCardIndex(), OffsetDateTime.now(ZoneOffset.UTC));
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

  private RoomRow requireRoom(String roomId) { var room = repository.findRoom(roomId); if (room == null) throw new CardRoomServiceException(404, "ROOM_NOT_FOUND", "카드방을 찾지 못했습니다."); return room; }
  private ParticipantRow requireParticipant(String participantId) { var p = repository.findParticipant(participantId); if (p == null) throw new CardRoomServiceException(404, "PARTICIPANT_NOT_FOUND", "참가자를 찾지 못했습니다."); return p; }
  private String nextRole(Long roomId) { return repository.listParticipants(roomId).stream().anyMatch(p -> "CHECKER".equals(p.role())) ? "MEMORIZER" : "CHECKER"; }
  private CardRoomProfileRequest normalizeProfile(CardRoomProfileRequest profile) { if (profile == null) throw new CardRoomServiceException(400, "PROFILE_REQUIRED", "카드방 프로필이 필요합니다."); return new CardRoomProfileRequest(normalizeText(profile.nickname(), 40, "닉네임을 입력해 주세요."), normalizeText(profile.characterId(), 80, "캐릭터를 선택해 주세요.")); }
  private String normalizeText(String value, int max, String message) { if (value == null || value.trim().isBlank()) throw new CardRoomServiceException(400, "INVALID_TEXT", message); return value.trim().substring(0, Math.min(value.trim().length(), max)); }
  private String normalizeVisibility(String value) { return "private".equals(value) ? "private" : "public"; }
  private String normalizeRole(String value, String fallback) { return "CHECKER".equals(value) || "MEMORIZER".equals(value) ? value : fallback; }
  private String normalizeResult(String value) { if ("OK".equals(value) || "GIVE_UP".equals(value) || "HINTED_OK".equals(value)) return value; throw new CardRoomServiceException(400, "INVALID_RESULT", "결과 값이 올바르지 않습니다."); }
  private String newPublicId(String prefix) { return prefix + "_" + UUID.randomUUID().toString().replace("-", ""); }
  private String iso(OffsetDateTime value) { return value == null ? null : value.toString(); }
  private CardRoomSummaryDto toSummary(RoomRow r) { return new CardRoomSummaryDto(r.publicId(), r.title(), r.deckTitle(), r.hostLabel(), r.visibility(), r.status(), r.currentCardIndex(), r.cardCount(), r.memorizerCount(), r.checkerCount(), iso(r.createdAt()), iso(r.updatedAt())); }
  private CardRoomParticipantDto toParticipant(ParticipantRow p) { return new CardRoomParticipantDto(p.publicId(), p.nickname(), p.characterId(), p.role(), p.isHost(), p.isReady(), iso(p.joinedAt())); }
  private CardRoomCardDto toCard(CardRow c) { return new CardRoomCardDto(c.publicId(), c.frontText(), c.backText(), c.orderIndex()); }
  private CardRoomMessageDto toMessage(MessageRow m) { return new CardRoomMessageDto(m.publicId(), m.senderParticipantId(), m.senderNickname(), m.content(), m.messageType(), iso(m.createdAt())); }
  private CardRoomResultDto toResult(ResultRow r) { return new CardRoomResultDto(r.publicId(), r.cardPublicId(), r.participantPublicId(), r.result(), iso(r.createdAt())); }
}
