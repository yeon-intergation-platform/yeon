package world.yeon.backend.import_drafts.service;

import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import world.yeon.backend.import_drafts.dto.*;
import world.yeon.backend.import_drafts.repository.ImportDraftRepository;

@Service
@Profile("jdbc")
public class ImportDraftService {
	private static final List<String> VALID_STATUSES = List.of("uploaded","analyzing","analyzed","edited","imported","error");
	private static final List<String> VALID_PROVIDERS = List.of("local","onedrive","googledrive");
	private final ImportDraftRepository repository;

	public ImportDraftService(ImportDraftRepository repository) {
		this.repository = repository;
	}

	public ListImportDraftsResponse listDrafts(UUID userId, String provider, List<String> statuses, Integer limit) {
		String normalizedProvider = provider == null || provider.isBlank() ? null : provider;
		if (normalizedProvider != null && !VALID_PROVIDERS.contains(normalizedProvider)) {
			throw new IllegalArgumentException("가져오기 초안 제공자 정보가 올바르지 않습니다.");
		}
		List<String> normalizedStatuses = statuses == null ? List.of() : statuses.stream().filter(VALID_STATUSES::contains).toList();
		int resolvedLimit = limit == null || limit <= 0 ? 20 : Math.min(limit, 20);
		return new ListImportDraftsResponse(repository.listOwnedDrafts(userId, normalizedProvider, normalizedStatuses, resolvedLimit).stream().map(this::toSnapshot).toList());
	}

	public ImportDraftSnapshotResponse getDraft(UUID userId, String draftId) {
		return toSnapshot(requireOwnedDraft(userId, draftId));
	}

	public OkResponse patchPreview(UUID userId, String draftId, PatchImportDraftPreviewRequest request) {
		ImportDraftRepository.ImportDraftRow row = requireOwnedDraft(userId, draftId);
		String status = request == null || request.status() == null ? "edited" : request.status();
		if (!List.of("analyzed", "edited").contains(status)) {
			throw new IllegalArgumentException("저장할 초안 상태가 올바르지 않습니다.");
		}
		repository.savePreview(userId, row.publicId(), request.preview(), status);
		return new OkResponse(true);
	}

	public OkResponse deleteDraft(UUID userId, String draftId) {
		ImportDraftRepository.ImportDraftRow row = requireOwnedDraft(userId, draftId);
		repository.deleteOwnedDraft(userId, row.publicId());
		return new OkResponse(true);
	}

	public ImportDraftFileResponse getDraftFile(UUID userId, String draftId) {
		ImportDraftRepository.ImportDraftRow row = requireOwnedDraft(userId, draftId);
		if (row.sourceFileBase64() == null || row.sourceFileBase64().isBlank()) {
			throw new ImportDraftServiceException(400, "LOCAL_DRAFT_ONLY", "로컬 초안 파일만 직접 복구할 수 있습니다.");
		}
		return new ImportDraftFileResponse(row.sourceFileName(), row.sourceMimeType() == null || row.sourceMimeType().isBlank() ? "application/octet-stream" : row.sourceMimeType(), row.sourceFileBase64());
	}

	private ImportDraftRepository.ImportDraftRow requireOwnedDraft(UUID userId, String draftId) {
		ImportDraftRepository.ImportDraftRow row = repository.findOwnedDraft(userId, draftId);
		if (row == null) throw new ImportDraftServiceException(404, "DRAFT_NOT_FOUND", "복구할 가져오기 초안을 찾지 못했습니다.");
		return row;
	}

	private ImportDraftSnapshotResponse toSnapshot(ImportDraftRepository.ImportDraftRow row) {
		String status = VALID_STATUSES.contains(row.status()) ? row.status() : "error";
		String provider = VALID_PROVIDERS.contains(row.provider()) ? row.provider() : "local";
		ImportDraftSourceFileResponse selectedFile = new ImportDraftSourceFileResponse(
			row.sourceFileId() == null ? "local-draft:" + row.publicId() : row.sourceFileId(),
			row.sourceFileName(),
			row.sourceByteSize() == null ? 0 : row.sourceByteSize(),
			(row.sourceLastModifiedAt() == null ? row.createdAt() : row.sourceLastModifiedAt()).toInstant().toString(),
			row.sourceMimeType(),
			false,
			"spreadsheet".equals(row.sourceFileKind()),
			"image".equals(row.sourceFileKind()),
			row.sourceFileKind()
		);
		return new ImportDraftSnapshotResponse(row.publicId(), provider, status, selectedFile, row.preview(), row.importResult(), row.errorMessage(), row.processingStage() == null ? "error" : row.processingStage(), row.processingProgress(), row.processingMessage(), row.expiresAt().toInstant().toString(), row.updatedAt().toInstant().toString());
	}
}
