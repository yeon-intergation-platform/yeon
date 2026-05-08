package world.yeon.backend.public_check_sessions.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import world.yeon.backend.public_check_sessions.dto.CreatePublicCheckSessionRequest;
import world.yeon.backend.public_check_sessions.dto.CreatePublicCheckSessionResponse;
import world.yeon.backend.public_check_sessions.dto.PublicCheckSessionSummaryResponse;
import world.yeon.backend.public_check_sessions.dto.UpdatePublicCheckSessionRequest;
import world.yeon.backend.public_check_sessions.dto.UpdatePublicCheckSessionResponse;
import world.yeon.backend.public_check_sessions.repository.PublicCheckSessionRepository;

@Service
@Profile("jdbc")
public class PublicCheckSessionService {
	private final PublicCheckSessionRepository repository;

	public PublicCheckSessionService(PublicCheckSessionRepository repository) {
		this.repository = repository;
	}

	public UpdatePublicCheckSessionResponse updateSession(String spaceId, String sessionId, UUID userId, UpdatePublicCheckSessionRequest request) {
		Long spaceInternalId = repository.findOwnedSpaceInternalId(spaceId, userId);
		if (spaceInternalId == null) throw new NoSuchElementException("스페이스를 찾지 못했습니다.");

		String normalizedStatus = normalizeStatus(request == null ? null : request.status());
		boolean closesAtProvided = request != null && (request.closesAt() != null || hasClosesAtField(request));
		OffsetDateTime closesAt = parseOptionalDateTime(request == null ? null : request.closesAt());

		var updated = closesAtProvided
			? repository.updateOwnedSession(spaceInternalId, sessionId, normalizedStatus, closesAt, OffsetDateTime.now(ZoneOffset.UTC))
			: repository.updateOwnedSessionWithoutClosesAt(spaceInternalId, sessionId, normalizedStatus, OffsetDateTime.now(ZoneOffset.UTC));

		if (updated == null) {
			throw new PublicCheckSessionServiceException(404, "SESSION_NOT_FOUND", "체크인 세션을 찾지 못했습니다.");
		}

		return new UpdatePublicCheckSessionResponse(toSummary(updated));
	}

	public CreatePublicCheckSessionResponse createSession(String spaceId, UUID userId, CreatePublicCheckSessionRequest request) {
		Long spaceInternalId = repository.findOwnedSpaceInternalId(spaceId, userId);
		if (spaceInternalId == null) throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		validateCreateRequest(request);
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var created = repository.insertSession(
			spaceInternalId,
			generatePublicId("pcs"),
			request.title().trim(),
			generatePublicToken(),
			"active",
			request.checkMode(),
			request.enabledMethods(),
			parseOptionalDateTime(request.opensAt()),
			parseOptionalDateTime(request.closesAt()),
			normalizeNullable(request.locationLabel()),
			request.latitude(),
			request.longitude(),
			request.radiusMeters(),
			userId,
			now
		);
		return new CreatePublicCheckSessionResponse(toSummary(created));
	}

	private PublicCheckSessionSummaryResponse toSummary(PublicCheckSessionRepository.SessionRow row) {
		return new PublicCheckSessionSummaryResponse(
			row.id(),
			row.title(),
			row.status(),
			row.checkMode(),
			row.enabledMethods(),
			"/check/" + row.publicToken(),
			row.opensAt(),
			row.closesAt(),
			row.locationLabel(),
			row.radiusMeters(),
			row.createdAt()
		);
	}

	private String normalizeStatus(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		if (!trimmed.equals("active") && !trimmed.equals("closed")) {
			throw new IllegalArgumentException("체크인 세션 수정 요청 값이 올바르지 않습니다.");
		}
		return trimmed;
	}

	private void validateCreateRequest(CreatePublicCheckSessionRequest request) {
		if (request == null || request.title() == null || request.title().trim().isBlank()) {
			throw new IllegalArgumentException("체크인 세션 생성 요청 값이 올바르지 않습니다.");
		}
		if (request.enabledMethods() == null || request.enabledMethods().isEmpty()) {
			throw new IllegalArgumentException("체크인 세션 생성 요청 값이 올바르지 않습니다.");
		}
		if (request.enabledMethods().contains("location") &&
			(request.latitude() == null || request.longitude() == null || request.radiusMeters() == null || normalizeNullable(request.locationLabel()) == null)) {
			throw new IllegalArgumentException("위치 기반 체크인을 쓰려면 검색 결과에서 기준 위치를 선택하고 반경을 설정해야 합니다.");
		}
		if (request.enabledMethods().contains("location") && request.radiusMeters() != null &&
			(request.radiusMeters() < 50 || request.radiusMeters() > 300)) {
			throw new IllegalArgumentException("위치 기반 체크인 반경은 50m에서 300m 사이로 설정해 주세요.");
		}
	}

	private OffsetDateTime parseOptionalDateTime(String raw) {
		if (raw == null) return null;
		try {
			return OffsetDateTime.parse(raw);
		} catch (DateTimeParseException error) {
			throw new IllegalArgumentException("체크인 세션 수정 요청 값이 올바르지 않습니다.");
		}
	}

	private boolean hasClosesAtField(UpdatePublicCheckSessionRequest request) {
		return true;
	}

	private String normalizeNullable(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		return trimmed.isBlank() ? null : trimmed;
	}

	private String generatePublicId(String prefix) {
		return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
	}

	private String generatePublicToken() {
		return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
	}
}
