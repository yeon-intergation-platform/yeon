package world.yeon.backend.import_drafts.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class ImportDraftRepository {
	public record ImportDraftRow(
		String publicId,
		UUID createdByUserId,
		String provider,
		String status,
		String sourceFileId,
		String sourceFileName,
		String sourceMimeType,
		String sourceFileKind,
		Integer sourceByteSize,
		OffsetDateTime sourceLastModifiedAt,
		String sourceFileBase64,
		String processingStage,
		Integer processingProgress,
		String processingMessage,
		Object preview,
		Object importResult,
		String errorMessage,
		OffsetDateTime expiresAt,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	private final EntityManager entityManager;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public ImportDraftRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public ImportDraftRow findOwnedDraft(UUID userId, String draftId) {
		List<?> rows = entityManager.createNativeQuery("""
			select public_id, created_by_user_id, provider, status, source_file_id, source_file_name, source_mime_type, source_file_kind, source_byte_size, source_last_modified_at, source_file_base64, processing_stage, processing_progress, processing_message, preview, import_result, error_message, expires_at, created_at, updated_at
			from public.import_drafts
			where public_id = :draftId and created_by_user_id = :userId and expires_at > now()
			limit 1
			""")
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.getResultList();
		return rows.isEmpty() ? null : toRow(rows.getFirst());
	}

	public List<ImportDraftRow> listOwnedDrafts(UUID userId, String provider, List<String> statuses, int limit) {
		String sql = """
			select public_id, created_by_user_id, provider, status, source_file_id, source_file_name, source_mime_type, source_file_kind, source_byte_size, source_last_modified_at, source_file_base64, processing_stage, processing_progress, processing_message, preview, import_result, error_message, expires_at, created_at, updated_at
			from public.import_drafts
			where created_by_user_id = :userId and expires_at > now()
			""" + (provider != null ? " and provider = :provider" : "") + (statuses != null && !statuses.isEmpty() ? " and status = any(:statuses)" : "") + " order by updated_at desc limit :limit";
			var query = entityManager.createNativeQuery(sql)
				.setParameter("userId", userId)
				.setParameter("limit", limit);
			if (provider != null) query.setParameter("provider", provider);
			if (statuses != null && !statuses.isEmpty()) query.setParameter("statuses", statuses.toArray(String[]::new));
			return query.getResultList().stream().map(this::toRow).toList();
	}

	@Transactional
	public void savePreview(UUID userId, String draftId, Object preview, String status) {
		entityManager.createNativeQuery("""
			update public.import_drafts
			set status = :status,
				processing_stage = 'preview_ready',
				processing_progress = 100,
				processing_message = :message,
				preview = cast(:previewJson as jsonb),
				error_message = null,
				updated_at = now()
			where public_id = :draftId and created_by_user_id = :userId
			""")
			.setParameter("status", status)
			.setParameter("message", "edited".equals(status) ? "수정된 미리보기를 저장했습니다." : "분석이 완료되었습니다.")
			.setParameter("previewJson", writeJson(preview))
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.executeUpdate();
	}

	@Transactional
	public void deleteOwnedDraft(UUID userId, String draftId) {
		entityManager.createNativeQuery("delete from public.import_drafts where public_id = :draftId and created_by_user_id = :userId")
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.executeUpdate();
	}

	private String writeJson(Object value) {
		try { return objectMapper.writeValueAsString(value); } catch (Exception error) { throw new IllegalStateException("draft preview json 직렬화에 실패했습니다.", error); }
	}

	private ImportDraftRow toRow(Object row) {
		Object[] v = (Object[]) row;
		return new ImportDraftRow((String) v[0], (UUID) v[1], (String) v[2], (String) v[3], (String) v[4], (String) v[5], (String) v[6], (String) v[7], (Integer) v[8], asOffsetDateTime(v[9]), (String) v[10], (String) v[11], (Integer) v[12], (String) v[13], v[14], v[15], (String) v[16], asOffsetDateTime(v[17]), asOffsetDateTime(v[18]), asOffsetDateTime(v[19]));
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime o) return o;
		if (value instanceof Timestamp t) return t.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof Instant i) return i.atOffset(ZoneOffset.UTC);
		if (value instanceof Date d) return d.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof LocalDateTime l) return l.atOffset(ZoneOffset.UTC);
		if (value instanceof ZonedDateTime z) return z.toOffsetDateTime();
		return OffsetDateTime.parse(value.toString());
	}
}
