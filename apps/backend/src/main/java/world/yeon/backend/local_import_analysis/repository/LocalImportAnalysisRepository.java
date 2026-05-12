package world.yeon.backend.local_import_analysis.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.local_import_analysis.service.FileKind;

@Repository
public class LocalImportAnalysisRepository {
	public record DraftSource(String publicId, String fileName, String mimeType, FileKind kind, byte[] bytes) {}
	public record FieldHint(String name, String fieldType) {}

	private static final int DRAFT_TTL_DAYS = 7;
	private final EntityManager entityManager;
	private final ObjectMapper objectMapper;

	public LocalImportAnalysisRepository(EntityManager entityManager, ObjectMapper objectMapper) {
		this.entityManager = entityManager;
		this.objectMapper = objectMapper;
	}

	@Transactional
	public String createLocalDraft(UUID userId, String fileName, String mimeType, FileKind kind, long byteSize, OffsetDateTime lastModifiedAt, byte[] bytes) {
		String publicId = generatePublicId("imp");
		entityManager.createNativeQuery("""
			insert into public.import_drafts (
				public_id, created_by_user_id, provider, status, source_file_id, source_file_name, source_mime_type, source_file_kind,
				source_byte_size, source_last_modified_at, source_file_base64, processing_stage, processing_progress, processing_message,
				expires_at, created_at, updated_at
			) values (
				:publicId, :userId, 'local', 'uploaded', null, :fileName, :mimeType, :fileKind,
				:byteSize, :lastModifiedAt, :base64, 'queued', 0, '분석 대기 중입니다.',
				now() + (:ttlDays * interval '1 day'), now(), now()
			)
			""")
			.setParameter("publicId", publicId)
			.setParameter("userId", userId)
			.setParameter("fileName", fileName)
			.setParameter("mimeType", blankToNull(mimeType))
			.setParameter("fileKind", kind.wireValue())
			.setParameter("byteSize", (int) Math.min(byteSize, Integer.MAX_VALUE))
			.setParameter("lastModifiedAt", lastModifiedAt)
			.setParameter("base64", Base64.getEncoder().encodeToString(bytes))
			.setParameter("ttlDays", DRAFT_TTL_DAYS)
			.executeUpdate();
		return publicId;
	}

	public DraftSource getOwnedDraftSource(UUID userId, String draftId) {
		List<?> rows = entityManager.createNativeQuery("""
			select public_id, source_file_name, source_mime_type, source_file_kind, source_file_base64
			from public.import_drafts
			where public_id = :draftId and created_by_user_id = :userId and expires_at > now()
			limit 1
			""")
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] values = (Object[]) rows.getFirst();
		String base64 = (String) values[4];
		if (base64 == null || base64.isBlank()) return new DraftSource((String) values[0], (String) values[1], (String) values[2], parseKind((String) values[3]), null);
		return new DraftSource((String) values[0], (String) values[1], (String) values[2], parseKind((String) values[3]), Base64.getDecoder().decode(base64));
	}

	@Transactional
	public void markAnalyzing(UUID userId, String draftId) {
		entityManager.createNativeQuery("""
			update public.import_drafts
			set status = 'analyzing', error_message = null, processing_stage = 'queued', processing_progress = 5, processing_message = '분석을 준비하고 있습니다.', updated_at = now()
			where public_id = :draftId and created_by_user_id = :userId
			""")
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.executeUpdate();
	}

	@Transactional
	public void saveProcessingState(UUID userId, String draftId, String stage, int progress, String message) {
		entityManager.createNativeQuery("""
			update public.import_drafts
			set status = 'analyzing', processing_stage = :stage, processing_progress = :progress, processing_message = :message, error_message = null, updated_at = now()
			where public_id = :draftId and created_by_user_id = :userId
			""")
			.setParameter("stage", stage)
			.setParameter("progress", progress)
			.setParameter("message", message)
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.executeUpdate();
	}

	@Transactional
	public void savePreview(UUID userId, String draftId, Object preview) {
		entityManager.createNativeQuery("""
			update public.import_drafts
			set status = 'analyzed', processing_stage = 'preview_ready', processing_progress = 100, processing_message = '분석이 완료되었습니다.', preview = cast(:previewJson as jsonb), error_message = null, updated_at = now()
			where public_id = :draftId and created_by_user_id = :userId
			""")
			.setParameter("previewJson", writeJson(preview))
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.executeUpdate();
	}

	@Transactional
	public void saveError(UUID userId, String draftId, String message) {
		entityManager.createNativeQuery("""
			update public.import_drafts
			set status = 'error', processing_stage = 'error', processing_progress = 0, processing_message = :message, error_message = :message, updated_at = now()
			where public_id = :draftId and created_by_user_id = :userId
			""")
			.setParameter("message", message)
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.executeUpdate();
	}

	public List<FieldHint> listFieldHints(String spaceId) {
		List<?> rows = entityManager.createNativeQuery("""
			select field.name, field.field_type
			from public.spaces space
			join public.member_tab_definitions tab on tab.space_id = space.id and tab.system_key = 'overview'
			join public.member_field_definitions field on field.space_id = space.id and field.tab_id = tab.id and field.deleted_at is null
			where space.public_id = :spaceId
			order by field.display_order asc
			""")
			.setParameter("spaceId", spaceId)
			.getResultList();
		return rows.stream().map(row -> {
			Object[] values = (Object[]) row;
			return new FieldHint((String) values[0], (String) values[1]);
		}).toList();
	}

	private FileKind parseKind(String value) {
		if (value == null) return FileKind.UNSUPPORTED;
		return switch (value) {
			case "spreadsheet" -> FileKind.SPREADSHEET;
			case "csv" -> FileKind.CSV;
			case "txt" -> FileKind.TXT;
			case "pdf" -> FileKind.PDF;
			case "image" -> FileKind.IMAGE;
			default -> FileKind.UNSUPPORTED;
		};
	}

	private String writeJson(Object value) {
		try { return objectMapper.writeValueAsString(value); }
		catch (JsonProcessingException error) { throw new IllegalStateException("가져오기 분석 JSON 직렬화에 실패했습니다.", error); }
	}

	private String generatePublicId(String prefix) { return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24); }
	private String blankToNull(String value) { return value == null || value.isBlank() ? null : value; }
}
