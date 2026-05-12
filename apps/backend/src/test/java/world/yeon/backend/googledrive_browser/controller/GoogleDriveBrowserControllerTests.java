package world.yeon.backend.googledrive_browser.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.googledrive_browser.dto.GoogleDriveFileResponse;
import world.yeon.backend.googledrive_browser.dto.GoogleDriveFilesResponse;
import world.yeon.backend.googledrive_browser.dto.GoogleDriveStatusResponse;
import world.yeon.backend.googledrive_browser.service.GoogleDriveBrowserService;
import world.yeon.backend.googledrive_browser.service.GoogleDriveBrowserServiceException;

@WebMvcTest(GoogleDriveBrowserController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class GoogleDriveBrowserControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000985");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private GoogleDriveBrowserService service;

	@Test void status와files응답shape를반환한다() throws Exception {
		when(service.getStatus(eq(USER_ID))).thenReturn(new GoogleDriveStatusResponse(true, true));
		when(service.listFiles(eq(USER_ID), eq(null))).thenReturn(new GoogleDriveFilesResponse(List.of(new GoogleDriveFileResponse("file-1", "students.xlsx", 12, "2026-05-08T00:00:00Z", "application/vnd.ms-excel"))));
		mockMvc.perform(get("/googledrive/status").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.connected").value(true));
		mockMvc.perform(get("/googledrive/files").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.files[0].id").value("file-1"));
	}

	@Test void content응답을반환한다() throws Exception {
		when(service.downloadFile(eq(USER_ID), eq("file-1"), eq("application/vnd.ms-excel"))).thenReturn(new GoogleDriveBrowserService.DownloadedFile("abc".getBytes(), "application/vnd.ms-excel"));
		mockMvc.perform(get("/googledrive/files/file-1/content").queryParam("mimeType", "application/vnd.ms-excel").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(content().bytes("abc".getBytes()));
	}

	@Test void service오류는상태코드를보존한다() throws Exception {
		when(service.getStatus(eq(USER_ID))).thenThrow(new GoogleDriveBrowserServiceException(401, "GOOGLE_DRIVE_NOT_CONNECTED", "Google Drive가 연결되어 있지 않습니다."));
		mockMvc.perform(get("/googledrive/status").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.message").value("Google Drive가 연결되어 있지 않습니다."));
	}
}
