package world.yeon.backend.public_content.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleListResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleResponse;
import world.yeon.backend.public_content.service.PublicContentAdminService;
import world.yeon.backend.public_content.service.PublicContentServiceException;

@WebMvcTest(PublicContentAdminController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class PublicContentAdminControllerTests {
	private static final UUID ADMIN_ID = UUID.fromString(
		"00000000-0000-0000-0000-000000000001"
	);

	@Autowired private MockMvc mockMvc;
	@MockitoBean private PublicContentAdminService service;

	@Test
	void admin목록은내부토큰과adminUserHeader가필요하다() throws Exception {
		when(service.listArticles(
				eq(ADMIN_ID),
				eq("blog"),
				eq("yeon"),
				eq("engineering"),
				eq("draft"),
				eq("internal")
			))
			.thenReturn(new PublicContentAdminArticleListResponse(List.of(adminArticle())));

		mockMvc.perform(withAdminHeaders(get("/api/v1/admin/content"))
				.param("channel", "blog")
				.param("serviceKey", "yeon")
				.param("category", "engineering")
				.param("status", "draft")
				.param("visibility", "internal"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.articles[0].id").value("draft-1"))
			.andExpect(jsonPath("$.articles[0].publishedAt").doesNotExist())
			.andExpect(jsonPath("$.articles[0].status").value("draft"))
			.andExpect(jsonPath("$.articles[0].sourcePaths[0]").value("docs/seo/example.md"));
	}

	@Test
	void admin상세는articleId를서비스로넘긴다() throws Exception {
		when(service.getArticle(eq(ADMIN_ID), eq("draft-1")))
			.thenReturn(new PublicContentAdminArticleResponse(adminArticle()));

		mockMvc.perform(withAdminHeaders(get("/api/v1/admin/content/draft-1")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.article.id").value("draft-1"))
			.andExpect(jsonPath("$.article.noindex").value(true));
	}

	@Test
	void admin권한오류는403을반환한다() throws Exception {
		when(service.listArticles(eq(ADMIN_ID), eq(null), eq(null), eq(null), eq(null), eq(null)))
			.thenThrow(new PublicContentServiceException(
				403,
				"ADMIN_REQUIRED",
				"관리자 권한이 필요합니다."
			));

		mockMvc.perform(withAdminHeaders(get("/api/v1/admin/content")))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.code").value("ADMIN_REQUIRED"));
	}

	@Test
	void 수정메서드는열지않는다() throws Exception {
		mockMvc.perform(withAdminHeaders(patch("/api/v1/admin/content/draft-1")))
			.andExpect(status().isMethodNotAllowed());
	}

	private MockHttpServletRequestBuilder withAdminHeaders(
		MockHttpServletRequestBuilder request
	) {
		return request
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.header("X-Yeon-User-Id", ADMIN_ID.toString());
	}

	private PublicContentAdminArticleDto adminArticle() {
		return new PublicContentAdminArticleDto(
			"draft-1",
			"blog",
			"yeon",
			"engineering",
			"engineering/draft-search-console-note",
			"Search Console 초안",
			"설명입니다.",
			"요약입니다.",
			"https://blog.yeon.world/engineering/draft-search-console-note",
			null,
			"2026-06-17T00:00:00Z",
			3,
			"markdown",
			"본문입니다.",
			null,
			null,
			"draft",
			"internal",
			true,
			null,
			null,
			null,
			"yeon",
			"yeon",
			List.of("docs/seo/example.md"),
			null
		);
	}
}
