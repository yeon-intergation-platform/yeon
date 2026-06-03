package world.yeon.backend.user_experience.admin.repository;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AdminExperienceRepository {
  private final JdbcTemplate jdbc;

  public AdminExperienceRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public record AdminUserRow(String id, String email, String displayName, String role, long totalXp, int cardDeckCount, OffsetDateTime createdAt) {}
  public record AdminCardDeckRow(String publicId, String title, String description, int itemCount, OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

  /** 어드민 유저 목록: 누적 경험치 + 보유 카드덱 수 포함(없으면 0). */
  public List<AdminUserRow> listUsers() {
    return jdbc.query("""
      select u.id, u.email, u.display_name, u.role,
        coalesce(x.total_xp, 0) as total_xp,
        (select count(*)::int from public.card_decks d where d.owner_user_id = u.id) as card_deck_count,
        u.created_at
      from public.users u
      left join public.user_experience x on x.user_id = u.id
      order by u.created_at desc
      """, (rs, i) -> new AdminUserRow(
        rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4),
        rs.getLong(5), rs.getInt(6), toOffset(rs.getTimestamp(7))));
  }

  /** 특정 유저가 만든 카드덱 목록(어드민). */
  public List<AdminCardDeckRow> listCardDecksForUser(UUID userId) {
    return jdbc.query("""
      select d.public_id, d.title, d.description,
        (select count(*)::int from public.card_deck_items i where i.deck_id = d.id) as item_count,
        d.created_at, d.updated_at
      from public.card_decks d
      where d.owner_user_id = ?
      order by d.created_at desc
      """, (rs, i) -> new AdminCardDeckRow(
        rs.getString(1), rs.getString(2), rs.getString(3), rs.getInt(4),
        toOffset(rs.getTimestamp(5)), toOffset(rs.getTimestamp(6))),
      userId);
  }

  /** 유저 존재 여부(어드민 대상 검증용). */
  public boolean userExists(UUID userId) {
    var rows = jdbc.queryForList("select 1 from public.users where id = ? limit 1", Integer.class, userId);
    return !rows.isEmpty();
  }

  private OffsetDateTime toOffset(Timestamp value) {
    return value == null ? null : value.toInstant().atOffset(ZoneOffset.UTC);
  }
}
