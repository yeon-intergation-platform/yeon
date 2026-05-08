package world.yeon.backend.space_templates.write.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import world.yeon.backend.space_templates.read.dto.SpaceTemplateSummaryResponse;
import world.yeon.backend.space_templates.write.dto.SnapshotSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.service.SpaceTemplateWriteService;

@WebMvcTest(SpaceTemplateSnapshotController.class)
@ActiveProfiles("jdbc")
class SpaceTemplateSnapshotControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private SpaceTemplateWriteService service;

	@Test
	void 스냅샷_요청을_201과_요약응답으로_반환한다() throws Exception {
		UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
		when(service.snapshotSpaceAsTemplate(
			eq("spc_1"),
			eq(userId),
			eq(new SnapshotSpaceTemplateRequest("스냅샷", "설명"))
		)).thenReturn(new SpaceTemplateSummaryResponse(
			"tpl_snapshot123",
			"스냅샷",
			"설명",
			false,
			1,
			0,
			List.of("개요"),
			List.of(),
			OffsetDateTime.parse("2026-05-07T00:00:00Z"),
			OffsetDateTime.parse("2026-05-07T00:00:00Z")
		));

		mockMvc.perform(post("/spaces/spc_1/snapshot-template")
				.header("X-Yeon-User-Id", userId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"name":"스냅샷","description":"설명"}
				"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.template.id").value("tpl_snapshot123"));
	}

	@Test
	void 없는_스페이스는_404로_번역한다() throws Exception {
		UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
		doThrow(new NoSuchElementException("스페이스를 찾지 못했습니다."))
			.when(service)
			.snapshotSpaceAsTemplate(eq("missing"), eq(userId), eq(new SnapshotSpaceTemplateRequest("스냅샷", null)));

		mockMvc.perform(post("/spaces/missing/snapshot-template")
				.header("X-Yeon-User-Id", userId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"name":"스냅샷","description":null}
				"""))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("SPACE_NOT_FOUND"));
	}
}
