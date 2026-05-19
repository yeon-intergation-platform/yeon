package world.yeon.backend.star_lobby.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class StarLobbyRepository {
	private static final TypeReference<List<String>> STRING_LIST_TYPE = new TypeReference<>() {};

	private final JdbcTemplate jdbc;
	private final ObjectMapper objectMapper;

	public StarLobbyRepository(JdbcTemplate jdbc, ObjectMapper objectMapper) {
		this.jdbc = jdbc;
		this.objectMapper = objectMapper;
	}

	public record ObservedRoomRow(
		UUID id,
		String roomKey,
		String title,
		Integer currentPlayers,
		Integer maxPlayers,
		String status,
		OffsetDateTime observedAt,
		OffsetDateTime lastSeenAt,
		OffsetDateTime disappearedAt,
		String rawText
	) {}

	public record AlertRuleRow(
		UUID id,
		UUID ownerUserId,
		String guestSessionId,
		String name,
		List<String> includeKeywords,
		List<String> excludeKeywords,
		Integer minPlayers,
		Integer maxPlayers,
		boolean enabled,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	public record AlertMatchRow(
		UUID id,
		UUID ruleId,
		UUID roomId,
		String status,
		String matchedKeyword,
		String suppressedKeyword,
		OffsetDateTime matchedAt
	) {}

	public List<ObservedRoomRow> listRecentRooms(int limit) {
		return jdbc.query("""
			select id, room_key, title, current_players, max_players, status, observed_at, last_seen_at, disappeared_at, raw_text
			from public.star_lobby_observed_rooms
			order by last_seen_at desc, updated_at desc
			limit ?
			""", (rs, i) -> observedRoom(rs), limit);
	}

	public ObservedRoomRow upsertObservedRoom(UUID id, String roomKey, String title, Integer currentPlayers, Integer maxPlayers, OffsetDateTime observedAt, String rawText) {
		return jdbc.queryForObject("""
			insert into public.star_lobby_observed_rooms (
			  id, room_key, title, current_players, max_players, status, observed_at, last_seen_at, disappeared_at, raw_text, created_at, updated_at
			) values (?, ?, ?, ?, ?, 'observed', ?, ?, null, ?, ?, ?)
			on conflict (room_key) do update set
			  title = excluded.title,
			  current_players = excluded.current_players,
			  max_players = excluded.max_players,
			  status = 'observed',
			  last_seen_at = excluded.last_seen_at,
			  disappeared_at = null,
			  raw_text = excluded.raw_text,
			  updated_at = excluded.updated_at
			returning id, room_key, title, current_players, max_players, status, observed_at, last_seen_at, disappeared_at, raw_text
			""", (rs, i) -> observedRoom(rs), id, roomKey, title, currentPlayers, maxPlayers, observedAt, observedAt, rawText, observedAt, observedAt);
	}

	public int markMissingRoomsDisappeared(Set<String> observedRoomKeys, OffsetDateTime now) {
		if (observedRoomKeys == null || observedRoomKeys.isEmpty()) {
			return jdbc.update("""
				update public.star_lobby_observed_rooms
				set status = 'disappeared', disappeared_at = ?, updated_at = ?
				where status = 'observed'
				""", now, now);
		}
		String placeholders = String.join(", ", java.util.Collections.nCopies(observedRoomKeys.size(), "?"));
		String sql = """
			update public.star_lobby_observed_rooms
			set status = 'disappeared', disappeared_at = ?, updated_at = ?
			where status = 'observed' and room_key not in (%s)
			""".formatted(placeholders);
		Object[] params = new Object[2 + observedRoomKeys.size()];
		params[0] = now;
		params[1] = now;
		int index = 2;
		for (String key : observedRoomKeys) params[index++] = key;
		return jdbc.update(sql, params);
	}

	public List<AlertRuleRow> listAlertRules(UUID ownerUserId, String guestSessionId) {
		if (ownerUserId != null) {
			return jdbc.query("""
				select id, owner_user_id, guest_session_id, name, include_keywords, exclude_keywords, min_players, max_players, enabled, created_at, updated_at
				from public.star_lobby_alert_rules
				where owner_user_id = ?
				order by created_at desc
				""", (rs, i) -> alertRule(rs), ownerUserId);
		}
		return jdbc.query("""
			select id, owner_user_id, guest_session_id, name, include_keywords, exclude_keywords, min_players, max_players, enabled, created_at, updated_at
			from public.star_lobby_alert_rules
			where guest_session_id = ?
			order by created_at desc
			""", (rs, i) -> alertRule(rs), guestSessionId);
	}

	public List<AlertRuleRow> listEnabledAlertRules() {
		return jdbc.query("""
			select id, owner_user_id, guest_session_id, name, include_keywords, exclude_keywords, min_players, max_players, enabled, created_at, updated_at
			from public.star_lobby_alert_rules
			where enabled = true
			order by created_at asc
			""", (rs, i) -> alertRule(rs));
	}

	public AlertRuleRow insertAlertRule(UUID id, UUID ownerUserId, String guestSessionId, String name, List<String> includeKeywords, List<String> excludeKeywords, Integer minPlayers, Integer maxPlayers, OffsetDateTime now) {
		return jdbc.queryForObject("""
			insert into public.star_lobby_alert_rules (
			  id, owner_user_id, guest_session_id, name, include_keywords, exclude_keywords, min_players, max_players, enabled, created_at, updated_at
			) values (?, ?, ?, ?, cast(? as jsonb), cast(? as jsonb), ?, ?, true, ?, ?)
			returning id, owner_user_id, guest_session_id, name, include_keywords, exclude_keywords, min_players, max_players, enabled, created_at, updated_at
			""", (rs, i) -> alertRule(rs), id, ownerUserId, guestSessionId, name, json(includeKeywords), json(excludeKeywords), minPlayers, maxPlayers, now, now);
	}

	public AlertMatchRow insertAlertMatchIfAbsent(UUID id, UUID ruleId, UUID roomId, String status, String matchedKeyword, String suppressedKeyword, OffsetDateTime matchedAt) {
		var rows = jdbc.query("""
			insert into public.star_lobby_alert_matches (id, rule_id, room_id, status, matched_keyword, suppressed_keyword, matched_at)
			values (?, ?, ?, ?, ?, ?, ?)
			on conflict (rule_id, room_id, status) do nothing
			returning id, rule_id, room_id, status, matched_keyword, suppressed_keyword, matched_at
			""", (rs, i) -> alertMatch(rs), id, ruleId, roomId, status, matchedKeyword, suppressedKeyword, matchedAt);
		return rows.isEmpty() ? null : rows.getFirst();
	}

	private ObservedRoomRow observedRoom(java.sql.ResultSet rs) throws java.sql.SQLException {
		return new ObservedRoomRow(
			rs.getObject("id", UUID.class),
			rs.getString("room_key"),
			rs.getString("title"),
			(Integer) rs.getObject("current_players"),
			(Integer) rs.getObject("max_players"),
			rs.getString("status"),
			toOffset(rs.getTimestamp("observed_at")),
			toOffset(rs.getTimestamp("last_seen_at")),
			toOffset(rs.getTimestamp("disappeared_at")),
			rs.getString("raw_text")
		);
	}

	private AlertRuleRow alertRule(java.sql.ResultSet rs) throws java.sql.SQLException {
		return new AlertRuleRow(
			rs.getObject("id", UUID.class),
			rs.getObject("owner_user_id", UUID.class),
			rs.getString("guest_session_id"),
			rs.getString("name"),
			stringList(rs.getObject("include_keywords")),
			stringList(rs.getObject("exclude_keywords")),
			(Integer) rs.getObject("min_players"),
			(Integer) rs.getObject("max_players"),
			rs.getBoolean("enabled"),
			toOffset(rs.getTimestamp("created_at")),
			toOffset(rs.getTimestamp("updated_at"))
		);
	}

	private AlertMatchRow alertMatch(java.sql.ResultSet rs) throws java.sql.SQLException {
		return new AlertMatchRow(
			rs.getObject("id", UUID.class),
			rs.getObject("rule_id", UUID.class),
			rs.getObject("room_id", UUID.class),
			rs.getString("status"),
			rs.getString("matched_keyword"),
			rs.getString("suppressed_keyword"),
			toOffset(rs.getTimestamp("matched_at"))
		);
	}

	private OffsetDateTime toOffset(Timestamp value) {
		return value == null ? null : value.toInstant().atOffset(ZoneOffset.UTC);
	}

	private String json(List<String> values) {
		try {
			return objectMapper.writeValueAsString(values == null ? List.of() : values);
		} catch (Exception error) {
			throw new IllegalStateException("스타 로비 키워드 JSON을 만들지 못했습니다.", error);
		}
	}

	private List<String> stringList(Object value) {
		if (value == null) return Collections.emptyList();
		try {
			return objectMapper.readValue(value.toString(), STRING_LIST_TYPE);
		} catch (Exception error) {
			throw new IllegalStateException("스타 로비 키워드 JSON을 해석하지 못했습니다.", error);
		}
	}
}
