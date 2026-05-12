package world.yeon.backend.activity_logs.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.activity_logs.dto.ActivityLogResponse;
import world.yeon.backend.activity_logs.dto.CreateActivityLogRequest;
import world.yeon.backend.activity_logs.dto.CreateActivityLogResponse;
import world.yeon.backend.activity_logs.dto.GetActivityLogsResponse;
import world.yeon.backend.activity_logs.repository.ActivityLogRepository;

@Service
public class ActivityLogService {
	public static final String MEMBER_MEMO_LOG_TYPE = "coaching-note";

	private final ActivityLogRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public ActivityLogService(ActivityLogRepository repository) {
		this.repository = repository;
	}

	public GetActivityLogsResponse getActivityLogs(String spaceId, String memberId, UUID userId, String type, Integer limit) {
		if (limit != null && (limit <= 0 || limit > 500)) throw new IllegalArgumentException("limit은 1 이상 500 이하의 정수여야 합니다.");
		var owned = requireOwnedMember(spaceId, memberId, userId);
		var logs = repository.findActivityLogs(owned.spaceInternalId(), owned.memberInternalId(), type == null || type.isBlank() ? null : type, limit).stream().map(this::toResponse).toList();
		int totalCount = repository.countActivityLogs(owned.spaceInternalId(), owned.memberInternalId(), type == null || type.isBlank() ? null : type);
		return new GetActivityLogsResponse(logs, totalCount);
	}

	public CreateActivityLogResponse createMemoLog(String spaceId, String memberId, UUID userId, CreateActivityLogRequest request) {
		var owned = requireOwnedMember(spaceId, memberId, userId);
		String noteText = normalizeMemoText(request == null ? null : request.text());
		if (noteText == null || noteText.isBlank()) throw new IllegalArgumentException("메모 내용을 입력해 주세요.");
		String authorLabel = normalizeNullable(request == null ? null : request.authorLabel(), 80);
		Map<String, Object> metadata = new LinkedHashMap<>();
		metadata.put("noteText", noteText);
		metadata.put("authorLabel", authorLabel == null ? "멘토" : authorLabel);
		var created = repository.insertMemoLog(
			owned.spaceInternalId(),
			owned.memberInternalId(),
			generatePublicId("alg"),
			OffsetDateTime.now(ZoneOffset.UTC),
			MEMBER_MEMO_LOG_TYPE,
			"manual",
			null,
			writeMetadata(metadata)
		);
		return new CreateActivityLogResponse(toResponse(created));
	}

	private ActivityLogRepository.OwnedMemberRow requireOwnedMember(String spaceId, String memberId, UUID userId) {
		var owned = repository.findOwnedMemberInSpace(spaceId, memberId, userId);
		if (owned == null) throw new ActivityLogServiceException(404, "MEMBER_NOT_FOUND", "해당 수강생을 찾을 수 없거나 접근 권한이 없습니다.");
		return owned;
	}

	private ActivityLogResponse toResponse(ActivityLogRepository.ActivityLogRow row) {
		return new ActivityLogResponse(row.id(), row.memberId(), row.spaceId(), row.type(), row.status(), row.recordedAt(), row.source(), row.metadata(), row.createdAt());
	}

	private String normalizeMemoText(String raw) {
		if (raw == null) return null;
		return raw.replaceAll("\\s+", " ").trim().substring(0, Math.min(raw.replaceAll("\\s+", " ").trim().length(), 2000));
	}

	private String normalizeNullable(String raw, int maxLength) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		if (trimmed.isBlank()) return null;
		return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
	}

	private String writeMetadata(Map<String, Object> metadata) {
		try {
			return objectMapper.writeValueAsString(metadata);
		} catch (JsonProcessingException error) {
			throw new IllegalStateException("activity log metadata를 직렬화하지 못했습니다.", error);
		}
	}

	private String generatePublicId(String prefix) {
		return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
	}
}
