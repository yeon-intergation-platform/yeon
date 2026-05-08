package world.yeon.backend.space_templates.read.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

import world.yeon.backend.space_templates.read.dto.SpaceTemplateDetailResponse;
import world.yeon.backend.space_templates.read.dto.SpaceTemplateSummaryResponse;
import world.yeon.backend.space_templates.read.service.SpaceTemplateReadService;

@WebMvcTest(SpaceTemplateReadController.class)
@ActiveProfiles("jdbc")
class SpaceTemplateReadControllerTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000001");

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private SpaceTemplateReadService service;

	@Test
	void 목록조회는유저헤더가없으면badRequest다() throws Exception {
		mockMvc.perform(get("/space-templates").accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest());
	}

	@Test
	void 목록조회는summary목록을반환한다() throws Exception {
		when(service.listTemplates(eq(OWNER_ID)))
			.thenReturn(
				List.of(
					new SpaceTemplateSummaryResponse(
						"tmpl-user-owned",
						"나의 템플릿",
						null,
						false,
						1,
						0,
						List.of("개요"),
						List.of(),
						OffsetDateTime.parse("2026-05-07T00:00:00Z"),
						OffsetDateTime.parse("2026-05-07T00:00:00Z")
					)
				)
			);

		mockMvc.perform(
			get("/space-templates")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.templates[0].id").value("tmpl-user-owned"))
			.andExpect(jsonPath("$.templates[0].isSystem").value(false));
	}

	@Test
	void 상세조회는없으면notFound다() throws Exception {
		when(service.getTemplateDetail("missing", OWNER_ID))
			.thenThrow(new NoSuchElementException("템플릿을 찾지 못했습니다."));

		mockMvc.perform(
			get("/space-templates/missing")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("SPACE_TEMPLATE_NOT_FOUND"));
	}

	@Test
	void 상세조회는detail응답을반환한다() throws Exception {
		when(service.getTemplateDetail("tmpl-system", OWNER_ID))
			.thenReturn(
				new SpaceTemplateDetailResponse(
					"tmpl-system",
					"시스템 템플릿",
					null,
					true,
					1,
					0,
					List.of("개요"),
					List.of(),
					OffsetDateTime.parse("2026-05-07T00:00:00Z"),
					OffsetDateTime.parse("2026-05-07T00:00:00Z"),
					List.of()
				)
			);

		mockMvc.perform(
			get("/space-templates/tmpl-system")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.template.id").value("tmpl-system"))
			.andExpect(jsonPath("$.template.isSystem").value(true));
	}
}
