package world.yeon.backend.card_decks.ai_usage.repository;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CardAiRequestUsageRepository {
	public record UsageRow(
		UUID id,
		UUID userId,
		String feature,
		String idempotencyKey,
		String requestFingerprint,
		String status,
		String responsePayload,
		String errorCode,
		OffsetDateTime createdAt,
		OffsetDateTime reservationStartedAt
	) {}

	public record GlobalBudgetUsage(
		long requestCount,
		long tokenCount
	) {}

	private final JdbcTemplate jdbcTemplate;

	public CardAiRequestUsageRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public void acquireGlobalBudgetLock() {
		jdbcTemplate.query(
			"select pg_advisory_xact_lock(hashtext('yeon:card-ai:global-daily-budget'))",
			row -> {
				// 전역 일일 예산 확인과 실행 예약을 하나의 직렬화 구간으로 묶는다.
			}
		);
	}

	public void acquireUserFeatureLock(UUID userId, String feature) {
		jdbcTemplate.query(
			"select pg_advisory_xact_lock(hashtext(?))",
			row -> {
				// 트랜잭션 범위 advisory lock 자체가 목적이라 반환값은 사용하지 않는다.
			},
			userId + ":" + feature
		);
	}

	public UsageRow findByIdempotencyKey(UUID userId, String feature, String idempotencyKey) {
		List<UsageRow> rows = jdbcTemplate.query(
			"""
			select id, user_id, feature, idempotency_key, request_fingerprint, status,
			       response_payload::text, error_code, created_at, reservation_started_at
			from yeon_backend.card_ai_request_usage
			where user_id = ? and feature = ? and idempotency_key = ?
			limit 1
			""",
			(row, index) -> new UsageRow(
				row.getObject("id", UUID.class),
				row.getObject("user_id", UUID.class),
				row.getString("feature"),
				row.getString("idempotency_key"),
				row.getString("request_fingerprint"),
				row.getString("status"),
				row.getString("response_payload"),
				row.getString("error_code"),
				row.getObject("created_at", OffsetDateTime.class),
				row.getObject("reservation_started_at", OffsetDateTime.class)
			),
			userId,
			feature,
			idempotencyKey
		);
		return rows.isEmpty() ? null : rows.getFirst();
	}

	public int countExecutionsSince(UUID userId, String feature, OffsetDateTime since) {
		Integer count = jdbcTemplate.queryForObject(
			"""
			select count(*)::int
			from yeon_backend.card_ai_request_executions
			where user_id = ? and feature = ? and started_at >= ?
			""",
			Integer.class,
			userId,
			feature,
			Timestamp.from(since.toInstant())
		);
		return count == null ? 0 : count;
	}

	public GlobalBudgetUsage readGlobalBudgetUsageSince(OffsetDateTime since) {
		Timestamp timestamp = Timestamp.from(since.toInstant());
		return jdbcTemplate.queryForObject(
			"""
			select
			  (select count(*)
			     from yeon_backend.card_ai_request_executions
			    where started_at >= ?) as request_count,
			  (select coalesce(sum(coalesce(actual_tokens, reserved_tokens)::bigint), 0)
			     from yeon_backend.card_ai_request_executions
			    where started_at >= ?) as token_count
			""",
			(row, index) -> new GlobalBudgetUsage(
				row.getLong("request_count"),
				row.getLong("token_count")
			),
			timestamp,
			timestamp
		);
	}

	public void insertExecution(
		UUID id,
		UUID usageId,
		UUID userId,
		String feature,
		int reservedTokens,
		OffsetDateTime startedAt
	) {
		int updated = jdbcTemplate.update(
			"""
			insert into yeon_backend.card_ai_request_executions
			  (id, usage_id, user_id, feature, reserved_tokens, started_at)
			values (?, ?, ?, ?, ?, ?)
			""",
			id,
			usageId,
			userId,
			feature,
			reservedTokens,
			Timestamp.from(startedAt.toInstant())
		);
		if (updated != 1) {
			throw new IllegalStateException("AI 요청 실행 횟수를 저장하지 못했습니다.");
		}
	}

	public void insertPending(
		UUID id,
		UUID userId,
		String feature,
		String idempotencyKey,
		String requestFingerprint,
		UUID activeExecutionId,
		OffsetDateTime createdAt
	) {
		int updated = jdbcTemplate.update(
			"""
			insert into yeon_backend.card_ai_request_usage
			  (id, user_id, feature, idempotency_key, request_fingerprint, status,
			   active_execution_id, created_at, reservation_started_at)
			values (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
			""",
			id,
			userId,
			feature,
			idempotencyKey,
			requestFingerprint,
			activeExecutionId,
			Timestamp.from(createdAt.toInstant()),
			Timestamp.from(createdAt.toInstant())
		);
		if (updated != 1) {
			throw new IllegalStateException("AI 요청 사용량 예약을 저장하지 못했습니다.");
		}
	}

	public boolean restartPending(
		UUID id,
		OffsetDateTime staleBefore,
		UUID activeExecutionId,
		OffsetDateTime restartedAt
	) {
		int updated = jdbcTemplate.update(
			"""
			update yeon_backend.card_ai_request_usage
			set active_execution_id = ?, reservation_started_at = ?, completed_at = null, error_code = null
			where id = ? and status = 'pending' and reservation_started_at <= ?
			""",
			activeExecutionId,
			Timestamp.from(restartedAt.toInstant()),
			id,
			Timestamp.from(staleBefore.toInstant())
		);
		return updated == 1;
	}

	public boolean restartFailed(UUID id, UUID activeExecutionId, OffsetDateTime restartedAt) {
		int updated = jdbcTemplate.update(
			"""
			update yeon_backend.card_ai_request_usage
			set status = 'pending', active_execution_id = ?, reservation_started_at = ?, completed_at = null,
			    error_code = null, response_payload = null
			where id = ? and status = 'failed'
			""",
			activeExecutionId,
			Timestamp.from(restartedAt.toInstant()),
			id
		);
		return updated == 1;
	}

	public void markSuccess(
		UUID id,
		UUID activeExecutionId,
		String model,
		Integer inputTokens,
		Integer outputTokens,
		long latencyMs,
		String responsePayload,
		OffsetDateTime completedAt
	) {
		int updated = jdbcTemplate.update(
			"""
			update yeon_backend.card_ai_request_usage
			set status = 'success',
			    model = ?,
			    input_tokens = ?,
			    output_tokens = ?,
			    latency_ms = ?,
			    response_payload = cast(? as jsonb),
			    error_code = null,
			    completed_at = ?
			where id = ? and status = 'pending' and active_execution_id = ?
			""",
			model,
			inputTokens,
			outputTokens,
			latencyMs,
			responsePayload,
			Timestamp.from(completedAt.toInstant()),
			id,
			activeExecutionId
		);
		if (updated != 1) {
			throw new IllegalStateException("AI 요청 사용량 성공 상태를 저장하지 못했습니다.");
		}
	}

	public void markExecutionActualTokens(UUID executionId, Integer inputTokens, Integer outputTokens) {
		if (inputTokens == null || outputTokens == null) return;
		long total = (long) inputTokens + outputTokens;
		if (total > Integer.MAX_VALUE) {
			throw new IllegalArgumentException("AI 실행 토큰 수가 허용 범위를 초과했습니다.");
		}
		int updated = jdbcTemplate.update(
			"""
			update yeon_backend.card_ai_request_executions
			set actual_tokens = ?
			where id = ?
			""",
			(int) total,
			executionId
		);
		if (updated != 1) {
			throw new IllegalStateException("AI 요청 실행 토큰 사용량을 저장하지 못했습니다.");
		}
	}

	public void markFailed(
		UUID id,
		UUID activeExecutionId,
		String errorCode,
		OffsetDateTime completedAt
	) {
		jdbcTemplate.update(
			"""
			update yeon_backend.card_ai_request_usage
			set status = 'failed', error_code = ?, completed_at = ?
			where id = ? and status = 'pending' and active_execution_id = ?
			""",
			errorCode,
			Timestamp.from(completedAt.toInstant()),
			id,
			activeExecutionId
		);
		// 만료된 이전 실행은 현재 재예약된 실행의 pending 상태를 바꾸지 않고 무시한다.
	}
}
