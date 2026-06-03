package world.yeon.backend.user_experience.repository;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ExperienceRepository {
  private final JdbcTemplate jdbc;

  public ExperienceRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public record ExperienceLogRow(String activityType, int xpAmount, String referenceId, long totalXpAfter, OffsetDateTime createdAt) {}

  /**
   * 멱등 가드용 로그 placeholder 삽입. 같은 (user, activity, reference)가 이미 있으면 0행(중복).
   * total_xp_after는 임시값(0)으로 넣고, 적립 후 {@link #updateLogTotalAfter}로 채운다.
   *
   * @return 새로 삽입되었으면 true(=이번 호출이 적립 주체), 이미 존재하면 false(중복).
   */
  public boolean insertLogIfAbsent(UUID userId, String activityType, int xpAmount, String referenceId) {
    int affected = jdbc.update("""
      insert into public.experience_log(user_id, activity_type, xp_amount, reference_id, total_xp_after)
      values (?, ?, ?, ?, 0)
      on conflict (user_id, activity_type, reference_id) do nothing
      """, userId, activityType, xpAmount, referenceId);
    return affected > 0;
  }

  /** 적립 확정 후, 방금 삽입한 로그 행의 total_xp_after를 실제 누적값으로 갱신한다. */
  public void updateLogTotalAfter(UUID userId, String activityType, String referenceId, long totalXpAfter) {
    jdbc.update("""
      update public.experience_log
      set total_xp_after = ?
      where user_id = ? and activity_type = ? and reference_id = ?
      """, totalXpAfter, userId, activityType, referenceId);
  }

  /** 누적 경험치에 delta를 더하고(없으면 생성) 갱신된 total_xp를 반환한다. */
  public long upsertAddXp(UUID userId, int delta) {
    Long total = jdbc.queryForObject("""
      insert into public.user_experience(user_id, total_xp)
      values (?, ?)
      on conflict (user_id) do update
        set total_xp = public.user_experience.total_xp + excluded.total_xp,
            updated_at = now()
      returning total_xp
      """, Long.class, userId, (long) delta);
    return total == null ? 0L : total;
  }

  /** 유저의 누적 경험치. 없으면 0. */
  public long findTotalXp(UUID userId) {
    List<Long> rows = jdbc.queryForList(
      "select total_xp from public.user_experience where user_id = ? limit 1", Long.class, userId);
    return rows.isEmpty() ? 0L : rows.getFirst();
  }

  /** 유저 적립 이력(최신순). */
  public List<ExperienceLogRow> listLog(UUID userId, int limit) {
    return jdbc.query("""
      select activity_type, xp_amount, reference_id, total_xp_after, created_at
      from public.experience_log
      where user_id = ?
      order by created_at desc, id desc
      limit ?
      """, (rs, i) -> new ExperienceLogRow(
        rs.getString(1), rs.getInt(2), rs.getString(3), rs.getLong(4), toOffset(rs.getTimestamp(5))),
      userId, limit);
  }

  private OffsetDateTime toOffset(Timestamp value) {
    return value == null ? null : value.toInstant().atOffset(ZoneOffset.UTC);
  }
}
