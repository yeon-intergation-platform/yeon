package world.yeon.backend.card_rooms.repository;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import world.yeon.backend.card_rooms.domain.CardRoomDisplayText;
import world.yeon.backend.card_rooms.domain.CardRoomMessageType;
import world.yeon.backend.card_rooms.domain.CardRoomParticipantRole;
import world.yeon.backend.card_rooms.domain.CardRoomResult;
import world.yeon.backend.card_rooms.domain.CardRoomStatus;
import world.yeon.backend.card_rooms.domain.CardRoomVisibility;

@Repository
public class CardRoomRepository {
  private final JdbcTemplate jdbc;
  public CardRoomRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

  public record RoomRow(Long internalId, String publicId, String title, String deckTitle, String visibility, String status, int currentCardIndex, OffsetDateTime createdAt, OffsetDateTime updatedAt, String hostLabel, int cardCount, int memorizerCount, int checkerCount) {}
  public record ParticipantRow(Long internalId, String publicId, Long roomId, String nickname, String characterId, String role, boolean isHost, boolean isReady, OffsetDateTime joinedAt) {}
  public record CardRow(Long internalId, String publicId, Long roomId, int orderIndex, String frontText, String backText) {}
  public record MessageRow(Long internalId, String publicId, String senderParticipantId, String senderNickname, String content, String messageType, OffsetDateTime createdAt) {}
  public record ResultRow(Long internalId, String publicId, String cardPublicId, String participantPublicId, String result, OffsetDateTime createdAt) {}
  public record DeckRow(Long internalId, String publicId, String title) {}
  public record DeckItemRow(String frontText, String backText) {}

  public List<RoomRow> listPublicRooms() {
    return jdbc.query("""
      select r.id, r.public_id, r.title, r.deck_title, r.visibility, r.status, r.current_card_index, r.created_at, r.updated_at,
        coalesce(h.nickname, ?) as host_label,
        (select count(*)::int from public.card_room_cards c where c.room_id = r.id) as card_count,
        (select count(*)::int from public.card_room_participants p where p.room_id = r.id and p.left_at is null and p.role = ?) as memorizer_count,
        (select count(*)::int from public.card_room_participants p where p.room_id = r.id and p.left_at is null and p.role = ?) as checker_count
      from public.card_rooms r
      left join public.card_room_participants h on h.room_id = r.id and h.is_host = true and h.left_at is null
      where r.visibility = ? and r.status not in (?, ?)
      order by r.created_at desc
      limit 100
      """, (rs, i) -> new RoomRow(rs.getLong(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5), rs.getString(6), rs.getInt(7), toOffset(rs.getTimestamp(8)), toOffset(rs.getTimestamp(9)), rs.getString(10), rs.getInt(11), rs.getInt(12), rs.getInt(13)), CardRoomDisplayText.GUEST_HOST_LABEL, CardRoomParticipantRole.MEMORIZER.dbValue(), CardRoomParticipantRole.CHECKER.dbValue(), CardRoomVisibility.PUBLIC.dbValue(), CardRoomStatus.FINISHED.dbValue(), CardRoomStatus.CLOSED.dbValue());
  }

  public RoomRow findRoom(String publicId) {
    var rows = jdbc.query("""
      select r.id, r.public_id, r.title, r.deck_title, r.visibility, r.status, r.current_card_index, r.created_at, r.updated_at,
        coalesce(h.nickname, ?) as host_label,
        (select count(*)::int from public.card_room_cards c where c.room_id = r.id) as card_count,
        (select count(*)::int from public.card_room_participants p where p.room_id = r.id and p.left_at is null and p.role = ?) as memorizer_count,
        (select count(*)::int from public.card_room_participants p where p.room_id = r.id and p.left_at is null and p.role = ?) as checker_count
      from public.card_rooms r
      left join public.card_room_participants h on h.room_id = r.id and h.is_host = true and h.left_at is null
      where r.public_id = ?
      """, (rs, i) -> new RoomRow(rs.getLong(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5), rs.getString(6), rs.getInt(7), toOffset(rs.getTimestamp(8)), toOffset(rs.getTimestamp(9)), rs.getString(10), rs.getInt(11), rs.getInt(12), rs.getInt(13)), CardRoomDisplayText.GUEST_HOST_LABEL, CardRoomParticipantRole.MEMORIZER.dbValue(), CardRoomParticipantRole.CHECKER.dbValue(), publicId);
    return rows.isEmpty() ? null : rows.getFirst();
  }

  public DeckRow findOwnedDeck(UUID userId, String deckId) {
    var rows = jdbc.query("select id, public_id, title from public.card_decks where owner_user_id = ? and public_id = ? limit 1", (rs, i) -> new DeckRow(rs.getLong(1), rs.getString(2), rs.getString(3)), userId, deckId);
    return rows.isEmpty() ? null : rows.getFirst();
  }

  public List<DeckItemRow> listDeckItems(Long deckInternalId) {
    return jdbc.query("select front_text, back_text from public.card_deck_items where deck_id = ? order by created_at asc, id asc", (rs, i) -> new DeckItemRow(rs.getString(1), rs.getString(2)), deckInternalId);
  }

  public RoomRow insertRoom(String publicId, String title, String deckTitle, String sourceDeckId, UUID ownerUserId, String ownerGuestId, CardRoomVisibility visibility, OffsetDateTime now) {
    jdbc.update("insert into public.card_rooms(public_id,title,deck_title,source_deck_public_id,owner_user_id,owner_guest_id,visibility,status,current_card_index,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?)", publicId, title, deckTitle, sourceDeckId, ownerUserId, ownerGuestId, visibility.dbValue(), CardRoomStatus.WAITING.dbValue(), 0, now, now);
    return findRoom(publicId);
  }

  public void insertCard(String publicId, Long roomId, int orderIndex, String frontText, String backText) {
    jdbc.update("insert into public.card_room_cards(public_id,room_id,order_index,front_text,back_text) values (?,?,?,?,?)", publicId, roomId, orderIndex, frontText, backText);
  }

  public ParticipantRow insertParticipant(String publicId, Long roomId, UUID userId, String guestId, String nickname, String characterId, CardRoomParticipantRole role, boolean isHost, OffsetDateTime now) {
    jdbc.update("insert into public.card_room_participants(public_id,room_id,user_id,guest_id,nickname,character_id,role,is_host,is_ready,joined_at) values (?,?,?,?,?,?,?,?,?,?)", publicId, roomId, userId, guestId, nickname, characterId, role.dbValue(), isHost, isHost, now);
    return findParticipant(publicId);
  }

  public ParticipantRow findActiveParticipantByIdentity(Long roomId, UUID userId, String guestId) {
    if (userId != null) {
      var rows = jdbc.query("select id, public_id, room_id, nickname, character_id, role, is_host, is_ready, joined_at from public.card_room_participants where room_id = ? and user_id = ? and left_at is null order by joined_at asc limit 1", (rs, i) -> participant(rs), roomId, userId);
      if (!rows.isEmpty()) return rows.getFirst();
    }
    if (guestId != null && !guestId.isBlank()) {
      var rows = jdbc.query("select id, public_id, room_id, nickname, character_id, role, is_host, is_ready, joined_at from public.card_room_participants where room_id = ? and guest_id = ? and left_at is null order by joined_at asc limit 1", (rs, i) -> participant(rs), roomId, guestId);
      if (!rows.isEmpty()) return rows.getFirst();
    }
    return null;
  }

  public ParticipantRow findParticipant(String publicId) {
    var rows = jdbc.query("select id, public_id, room_id, nickname, character_id, role, is_host, is_ready, joined_at from public.card_room_participants where public_id = ? and left_at is null limit 1", (rs, i) -> participant(rs), publicId);
    return rows.isEmpty() ? null : rows.getFirst();
  }

  public List<ParticipantRow> listParticipants(Long roomId) {
    return jdbc.query("select id, public_id, room_id, nickname, character_id, role, is_host, is_ready, joined_at from public.card_room_participants where room_id = ? and left_at is null order by is_host desc, joined_at asc", (rs, i) -> participant(rs), roomId);
  }

  public List<CardRow> listCards(Long roomId) {
    return jdbc.query("select id, public_id, room_id, order_index, front_text, back_text from public.card_room_cards where room_id = ? order by order_index asc", (rs, i) -> new CardRow(rs.getLong(1), rs.getString(2), rs.getLong(3), rs.getInt(4), rs.getString(5), rs.getString(6)), roomId);
  }

  public CardRow findCard(String cardPublicId) {
    var rows = jdbc.query("select id, public_id, room_id, order_index, front_text, back_text from public.card_room_cards where public_id = ? limit 1", (rs, i) -> new CardRow(rs.getLong(1), rs.getString(2), rs.getLong(3), rs.getInt(4), rs.getString(5), rs.getString(6)), cardPublicId);
    return rows.isEmpty() ? null : rows.getFirst();
  }

  public List<MessageRow> listMessages(Long roomId) {
    return jdbc.query("""
      select m.id, m.public_id, p.public_id, p.nickname, m.content, m.message_type, m.created_at
      from public.card_room_messages m
      left join public.card_room_participants p on p.id = m.participant_id
      where m.room_id = ? order by m.created_at asc, m.id asc limit 200
      """, (rs, i) -> new MessageRow(rs.getLong(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5), rs.getString(6), toOffset(rs.getTimestamp(7))), roomId);
  }

  public MessageRow insertMessage(String publicId, Long roomId, Long participantId, String content, CardRoomMessageType type, OffsetDateTime now) {
    jdbc.update("insert into public.card_room_messages(public_id,room_id,participant_id,content,message_type,created_at) values (?,?,?,?,?,?)", publicId, roomId, participantId, content, type.dbValue(), now);
    return listMessages(roomId).stream().filter(m -> m.publicId().equals(publicId)).findFirst().orElse(null);
  }

  public List<ResultRow> listResults(Long roomId) {
    return jdbc.query("""
      select r.id, r.public_id, c.public_id, p.public_id, r.result, r.created_at
      from public.card_room_results r
      join public.card_room_cards c on c.id = r.card_id
      join public.card_room_participants p on p.id = r.participant_id
      where r.room_id = ? order by r.created_at asc, r.id asc
      """, (rs, i) -> new ResultRow(rs.getLong(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5), toOffset(rs.getTimestamp(6))), roomId);
  }

  public ResultRow insertResult(String publicId, Long roomId, Long cardId, Long participantId, CardRoomResult result, OffsetDateTime now) {
    jdbc.update("insert into public.card_room_results(public_id,room_id,card_id,participant_id,result,created_at) values (?,?,?,?,?,?)", publicId, roomId, cardId, participantId, result.dbValue(), now);
    return listResults(roomId).stream().filter(r -> r.publicId().equals(publicId)).findFirst().orElse(null);
  }

  public void updateStatus(Long roomId, CardRoomStatus status, int currentCardIndex, OffsetDateTime now) {
    jdbc.update("update public.card_rooms set status = ?, current_card_index = ?, updated_at = ? where id = ?", status.dbValue(), currentCardIndex, now, roomId);
  }

  public int finishRoomsWithoutActiveParticipants(OffsetDateTime now) {
    return jdbc.update("""
      update public.card_rooms r
      set status = ?, updated_at = ?
      where r.status not in (?, ?)
        and not exists (
          select 1
          from public.card_room_participants p
          where p.room_id = r.id and p.left_at is null
        )
      """, CardRoomStatus.CLOSED.dbValue(), now, CardRoomStatus.FINISHED.dbValue(), CardRoomStatus.CLOSED.dbValue());
  }

  public int finishStaleRooms(OffsetDateTime cutoff, OffsetDateTime now) {
    return jdbc.update("""
      update public.card_rooms
      set status = ?, updated_at = ?
      where status not in (?, ?) and updated_at < ?
      """, CardRoomStatus.CLOSED.dbValue(), now, CardRoomStatus.FINISHED.dbValue(), CardRoomStatus.CLOSED.dbValue(), cutoff);
  }

  public void updateParticipant(Long participantId, String nickname, String characterId, CardRoomParticipantRole role, Boolean isReady) {
    jdbc.update("update public.card_room_participants set nickname = coalesce(cast(? as varchar), nickname), character_id = coalesce(cast(? as varchar), character_id), role = coalesce(cast(? as varchar), role), is_ready = coalesce(cast(? as boolean), is_ready) where id = ?", nickname, characterId, role == null ? null : role.dbValue(), isReady, participantId);
  }

  public void leaveParticipant(Long participantId, OffsetDateTime now) {
    jdbc.update("update public.card_room_participants set left_at = ? where id = ?", now, participantId);
  }

  private ParticipantRow participant(java.sql.ResultSet rs) throws java.sql.SQLException {
    return new ParticipantRow(rs.getLong(1), rs.getString(2), rs.getLong(3), rs.getString(4), rs.getString(5), rs.getString(6), rs.getBoolean(7), rs.getBoolean(8), toOffset(rs.getTimestamp(9)));
  }

  private OffsetDateTime toOffset(Timestamp value) {
    return value == null ? null : value.toInstant().atOffset(ZoneOffset.UTC);
  }
}
