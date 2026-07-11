package world.yeon.backend.card_decks.ai_usage.service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.card_decks.ai_usage.domain.CardAiFeature;
import world.yeon.backend.card_decks.ai_usage.repository.CardAiRequestUsageRepository;

@Service
public class CardAiRequestUsageService {
	private static final Duration PENDING_LEASE = Duration.ofMinutes(2);

	public enum ReservationState {
		NEW,
		REPLAY_SUCCESS,
		PENDING,
		FAILED,
		CONFLICT,
		RATE_LIMITED,
		AI_DISABLED,
		GLOBAL_BUDGET_EXHAUSTED
	}

	public record Reservation(
		ReservationState state,
		UUID usageId,
		UUID executionId,
		String responsePayload,
		String errorCode
	) {
		public Reservation(
			ReservationState state,
			UUID usageId,
			String responsePayload,
			String errorCode
		) {
			this(state, usageId, null, responsePayload, errorCode);
		}
	}

	private final CardAiRequestUsageRepository repository;
	private final CardAiGlobalBudgetPolicy globalBudgetPolicy;

	public CardAiRequestUsageService(
		CardAiRequestUsageRepository repository,
		CardAiGlobalBudgetPolicy globalBudgetPolicy
	) {
		this.repository = repository;
		this.globalBudgetPolicy = globalBudgetPolicy;
	}

	@Transactional
	public Reservation reserve(
		UUID userId,
		CardAiFeature feature,
		String idempotencyKey,
		String requestFingerprint
	) {
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		repository.acquireGlobalBudgetLock();
		repository.acquireUserFeatureLock(userId, feature.value());
		var existing = repository.findByIdempotencyKey(userId, feature.value(), idempotencyKey);
		if (existing != null) {
			if (!existing.requestFingerprint().equals(requestFingerprint)) {
				return new Reservation(ReservationState.CONFLICT, existing.id(), null, null);
			}
			return switch (existing.status()) {
				case "success" -> new Reservation(
					ReservationState.REPLAY_SUCCESS,
					existing.id(),
					existing.responsePayload(),
					null
				);
				case "failed" -> restartFailedOrRateLimited(existing, userId, feature, now);
				default -> reclaimOrPending(existing, userId, feature, now);
			};
		}

		ReservationState blockedState = executionBlockedState(userId, feature, now);
		if (blockedState != null) {
			return new Reservation(blockedState, null, null, null);
		}

		UUID usageId = UUID.randomUUID();
		UUID executionId = UUID.randomUUID();
		repository.insertPending(
			usageId,
			userId,
			feature.value(),
			idempotencyKey,
			requestFingerprint,
			executionId,
			now
		);
		repository.insertExecution(
			executionId,
			usageId,
			userId,
			feature.value(),
			feature.maximumReservedTokens(),
			now
		);
		return new Reservation(ReservationState.NEW, usageId, executionId, null, null);
	}

	private Reservation reclaimOrPending(
		CardAiRequestUsageRepository.UsageRow existing,
		UUID userId,
		CardAiFeature feature,
		OffsetDateTime now
	) {
		OffsetDateTime staleBefore = now.minus(PENDING_LEASE);
		if (existing.reservationStartedAt() == null || existing.reservationStartedAt().isAfter(staleBefore)) {
			return new Reservation(ReservationState.PENDING, existing.id(), null, null);
		}
		ReservationState blockedState = executionBlockedState(userId, feature, now);
		if (blockedState != null) {
			return new Reservation(blockedState, existing.id(), null, null);
		}
		UUID executionId = UUID.randomUUID();
		if (repository.restartPending(existing.id(), staleBefore, executionId, now)) {
			return startExecution(existing.id(), userId, feature, executionId, now);
		}
		return new Reservation(ReservationState.PENDING, existing.id(), null, null);
	}

	private Reservation restartFailedOrRateLimited(
		CardAiRequestUsageRepository.UsageRow existing,
		UUID userId,
		CardAiFeature feature,
		OffsetDateTime now
	) {
		ReservationState blockedState = executionBlockedState(userId, feature, now);
		if (blockedState != null) {
			return new Reservation(blockedState, existing.id(), null, null);
		}
		UUID executionId = UUID.randomUUID();
		if (!repository.restartFailed(existing.id(), executionId, now)) {
			return new Reservation(ReservationState.FAILED, existing.id(), null, existing.errorCode());
		}
		return startExecution(existing.id(), userId, feature, executionId, now);
	}

	private Reservation startExecution(
		UUID usageId,
		UUID userId,
		CardAiFeature feature,
		UUID executionId,
		OffsetDateTime now
	) {
		repository.insertExecution(
			executionId,
			usageId,
			userId,
			feature.value(),
			feature.maximumReservedTokens(),
			now
		);
		return new Reservation(ReservationState.NEW, usageId, executionId, null, null);
	}

	private boolean isRateLimited(UUID userId, CardAiFeature feature, OffsetDateTime now) {
		int recentCount = repository.countExecutionsSince(
			userId,
			feature.value(),
			now.minus(feature.window())
		);
		return recentCount >= feature.limit();
	}

	private ReservationState executionBlockedState(
		UUID userId,
		CardAiFeature feature,
		OffsetDateTime now
	) {
		if (!globalBudgetPolicy.enabled()) {
			return ReservationState.AI_DISABLED;
		}
		OffsetDateTime dayStart = now.toLocalDate().atStartOfDay().atOffset(ZoneOffset.UTC);
		var globalUsage = repository.readGlobalBudgetUsageSince(dayStart);
		if (
			globalUsage == null
				|| globalUsage.requestCount() >= globalBudgetPolicy.dailyRequestLimit()
				|| globalUsage.tokenCount() + feature.maximumReservedTokens() > globalBudgetPolicy.dailyTokenLimit()
		) {
			return ReservationState.GLOBAL_BUDGET_EXHAUSTED;
		}
		return isRateLimited(userId, feature, now) ? ReservationState.RATE_LIMITED : null;
	}

	@Transactional
	public void markSuccess(
		UUID usageId,
		UUID executionId,
		String model,
		Integer inputTokens,
		Integer outputTokens,
		long latencyMs,
		String responsePayload
	) {
		if (executionId == null) {
			throw new IllegalArgumentException("AI 성공 결과에는 실행 식별자가 필요합니다.");
		}
		repository.markSuccess(
			usageId,
			executionId,
			model,
			inputTokens,
			outputTokens,
			latencyMs,
			responsePayload,
			OffsetDateTime.now(ZoneOffset.UTC)
		);
		repository.markExecutionActualTokens(executionId, inputTokens, outputTokens);
	}

	@Transactional
	public void markFailed(UUID usageId, UUID executionId, String errorCode) {
		if (executionId == null) return;
		repository.markFailed(usageId, executionId, errorCode, OffsetDateTime.now(ZoneOffset.UTC));
	}
}
