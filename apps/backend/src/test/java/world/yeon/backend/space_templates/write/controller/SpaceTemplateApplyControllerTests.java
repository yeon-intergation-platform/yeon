package world.yeon.backend.space_templates.write.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import world.yeon.backend.space_templates.write.dto.ApplySpaceTemplateRequest;
import world.yeon.backend.space_templates.write.service.SpaceTemplateWriteService;

@WebMvcTest(SpaceTemplateApplyController.class)
@ActiveProfiles("dev.local")
class SpaceTemplateApplyControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private SpaceTemplateWriteService service;

	@Test
	void 적용_요청은_ok_true를_반환한다() throws Exception {
		UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
		doNothing().when(service).applyTemplateToSpace("tpl_1", "spc_1", userId);

		mockMvc.perform(post("/spaces/spc_1/apply-template")
				.header("X-Yeon-User-Id", userId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"templateId":"tpl_1"}
				"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.ok").value(true));
	}

	@Test
	void 없는_템플릿은_404로_번역한다() throws Exception {
		UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
		doThrow(new NoSuchElementException("템플릿을 찾지 못했습니다."))
			.when(service)
			.applyTemplateToSpace("missing", "spc_1", userId);

		mockMvc.perform(post("/spaces/spc_1/apply-template")
				.header("X-Yeon-User-Id", userId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"templateId":"missing"}
				"""))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("SPACE_TEMPLATE_NOT_FOUND"));
	}
}
