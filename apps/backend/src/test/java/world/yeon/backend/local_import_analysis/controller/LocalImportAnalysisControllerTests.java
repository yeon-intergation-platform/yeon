package world.yeon.backend.local_import_analysis.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.local_import_analysis.dto.LocalAnalyzeResponse;
import world.yeon.backend.local_import_analysis.service.LocalImportAnalysisException;
import world.yeon.backend.local_import_analysis.service.LocalImportAnalysisService;

@WebMvcTest(LocalImportAnalysisController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class LocalImportAnalysisControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000951");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private LocalImportAnalysisService service;

	@Test void multipart분석응답shape를반환한다() throws Exception {
		when(service.analyze(eq(OWNER_ID), any(), any())).thenReturn(new LocalAnalyzeResponse("imp_1", Map.of("cohorts", java.util.List.of()), null));
		MockMultipartFile file = new MockMultipartFile("file", "students.csv", "text/csv", "name\n홍길동".getBytes());
		mockMvc.perform(multipart("/integrations/local/analyze").file(file).header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.draftId").value("imp_1"))
			.andExpect(jsonPath("$.preview.cohorts").isArray());
	}

	@Test void service오류는상태코드를보존한다() throws Exception {
		when(service.analyze(eq(OWNER_ID), any(), any())).thenThrow(new LocalImportAnalysisException(400, "UNSUPPORTED_FILE_KIND", "지원하지 않는 파일 형식입니다."));
		MockMultipartFile file = new MockMultipartFile("file", "archive.zip", "application/zip", "bad".getBytes());
		mockMvc.perform(multipart("/integrations/local/analyze").file(file).header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("지원하지 않는 파일 형식입니다."));
	}
}
