package world.yeon.backend.space_templates.write.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
import world.yeon.backend.space_templates.write.dto.CreateSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.dto.UpdateSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.service.SpaceTemplateWriteService;

@WebMvcTest(SpaceTemplateWriteController.class)
@ActiveProfiles("jdbc")
class SpaceTemplateWriteControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private SpaceTemplateWriteService service;

	@Test
	void 생성_요청을_201과_요약_응답으로_반환한다() throws Exception {
		UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
		when(service.createTemplate(
			eq(userId),
			eq(new CreateSpaceTemplateRequest(
				"새 템플릿",
				"새 설명",
				List.of(
					new CreateSpaceTemplateRequest.TemplateTabRequest(
						"개요",
						"system",
						"overview",
						0,
						List.of()
					)
				)
			))
		)).thenReturn(new SpaceTemplateSummaryResponse(
			"tpl_created123",
			"새 템플릿",
			"새 설명",
			false,
			1,
			0,
			List.of("개요"),
			List.of(),
			OffsetDateTime.parse("2026-05-07T00:00:00Z"),
			OffsetDateTime.parse("2026-05-07T00:00:00Z")
		));

		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/space-templates")
				.header("X-Yeon-User-Id", userId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"name":"새 템플릿","description":"새 설명","tabsConfig":[{"name":"개요","tabType":"system","systemKey":"overview","displayOrder":0,"fields":[]}]}
				"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.template.id").value("tpl_created123"))
				.andExpect(jsonPath("$.template.name").value("새 템플릿"));
	}

	@Test
	void 수정_요청을_요약_응답으로_반환한다() throws Exception {
		UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
		when(service.updateTemplate(
			eq("tmpl-1"),
			eq(userId),
			eq(new UpdateSpaceTemplateRequest("새 이름", "새 설명"))
		)).thenReturn(new SpaceTemplateSummaryResponse(
			"tmpl-1",
			"새 이름",
			"새 설명",
			false,
			1,
			0,
			List.of("개요"),
			List.of(),
			OffsetDateTime.parse("2026-05-07T00:00:00Z"),
			OffsetDateTime.parse("2026-05-07T01:00:00Z")
		));

		mockMvc.perform(patch("/space-templates/tmpl-1")
				.header("X-Yeon-User-Id", userId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"name":"새 이름","description":"새 설명"}
				"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.template.id").value("tmpl-1"))
				.andExpect(jsonPath("$.template.name").value("새 이름"));
	}

	@Test
	void 수정_금지_오류를_403으로_번역한다() throws Exception {
		UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
		doThrow(new IllegalStateException("시스템 템플릿은 수정할 수 없습니다."))
			.when(service)
			.updateTemplate(eq("tmpl-system"), eq(userId), eq(new UpdateSpaceTemplateRequest("수정", null)));

		mockMvc.perform(patch("/space-templates/tmpl-system")
				.header("X-Yeon-User-Id", userId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"name":"수정","description":null}
				"""))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("SPACE_TEMPLATE_FORBIDDEN"));
	}

	@Test
	void 삭제_요청은_204를_반환한다() throws Exception {
		UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
		doNothing().when(service).deleteTemplate("tmpl-delete", userId);

		mockMvc.perform(delete("/space-templates/tmpl-delete")
				.header("X-Yeon-User-Id", userId))
				.andExpect(status().isNoContent());
	}

	@Test
	void 삭제_미존재_오류를_404로_번역한다() throws Exception {
		UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
		doThrow(new NoSuchElementException("템플릿을 찾지 못했습니다."))
			.when(service)
			.deleteTemplate("missing", userId);

		mockMvc.perform(delete("/space-templates/missing")
				.header("X-Yeon-User-Id", userId))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("SPACE_TEMPLATE_NOT_FOUND"));
	}

	@Test
	void 복제_요청을_201과_요약_응답으로_반환한다() throws Exception {
		UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
		when(service.duplicateTemplate("tmpl-source", userId)).thenReturn(new SpaceTemplateSummaryResponse(
			"tpl_duplicated123",
			"원본 복사본",
			"설명",
			false,
			1,
			0,
			List.of("개요"),
			List.of(),
			OffsetDateTime.parse("2026-05-07T00:00:00Z"),
			OffsetDateTime.parse("2026-05-07T00:00:00Z")
		));

		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/space-templates/tmpl-source/duplicate")
				.header("X-Yeon-User-Id", userId))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.template.id").value("tpl_duplicated123"))
				.andExpect(jsonPath("$.template.name").value("원본 복사본"));
	}
}
