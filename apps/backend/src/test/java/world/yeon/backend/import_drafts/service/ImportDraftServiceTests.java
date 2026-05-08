package world.yeon.backend.import_drafts.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.import_drafts.dto.PatchImportDraftPreviewRequest;
import world.yeon.backend.import_drafts.repository.ImportDraftRepository;

@ExtendWith(MockitoExtension.class)
class ImportDraftServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000952");
	@Mock private ImportDraftRepository repository;
	private ImportDraftService service;

	@BeforeEach void setUp() { service = new ImportDraftService(repository); }

	@Test void invalidStatus는error로fallback한다() {
		when(repository.findOwnedDraft(OWNER_ID, "draft-1")).thenReturn(row("oops", "cloud"));
		var result = service.getDraft(OWNER_ID, "draft-1");
		assertThat(result.status()).isEqualTo("error");
		assertThat(result.provider()).isEqualTo("local");
	}

	@Test void localFile없으면400이다() {
		when(repository.findOwnedDraft(OWNER_ID, "draft-1")).thenReturn(new ImportDraftRepository.ImportDraftRow("draft-1", OWNER_ID, "googledrive", "uploaded", null, "students.csv", "text/csv", "csv", 10, OffsetDateTime.parse("2026-05-08T07:00:00Z"), null, "queued", 0, "대기", null, null, null, OffsetDateTime.parse("2026-05-09T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z")));
		assertThatThrownBy(() -> service.getDraftFile(OWNER_ID, "draft-1")).isInstanceOf(ImportDraftServiceException.class).hasMessage("로컬 초안 파일만 직접 복구할 수 있습니다.");
	}

	@Test void previewPatch는ok를반환한다() {
		when(repository.findOwnedDraft(OWNER_ID, "draft-1")).thenReturn(row("uploaded", "local"));
		var result = service.patchPreview(OWNER_ID, "draft-1", new PatchImportDraftPreviewRequest(List.of(), "edited"));
		assertThat(result.ok()).isTrue();
	}

	private ImportDraftRepository.ImportDraftRow row(String status, String provider) {
		return new ImportDraftRepository.ImportDraftRow("draft-1", OWNER_ID, provider, status, null, "students.csv", "text/csv", "csv", 10, OffsetDateTime.parse("2026-05-08T07:00:00Z"), "YmFzZTY0", "queued", 0, "대기", null, null, null, OffsetDateTime.parse("2026-05-09T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"));
	}
}
