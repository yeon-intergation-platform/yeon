package world.yeon.backend.public_content.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleDetailDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleListResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentRedirectResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleSummaryDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentSitemapEntryDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentSitemapResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentSnapshotResponse;
import world.yeon.backend.public_content.service.PublicContentService;
import world.yeon.backend.public_content.service.PublicContentServiceException;

@WebMvcTest(PublicContentController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class PublicContentControllerTests {
	@Autowired private MockMvc mockMvc;
	@MockitoBean private PublicContentService service;

	@Test
	void 공개글목록은내부토큰없이반환한다() throws Exception {
		when(service.listArticles(eq("support"), eq("nexa"), eq("guides")))
			.thenReturn(new PublicContentArticleListResponse(List.of(summary())));

		mockMvc.perform(get("/api/v1/content")
				.param("channel", "support")
				.param("serviceKey", "nexa")
				.param("category", "guides"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.articles[0].serviceKey").value("nexa"))
			.andExpect(jsonPath("$.articles[0].slug").value("nexa/guides/add-nexa-discord-bot"));
	}

	@Test
	void 공개글상세는slug를서비스로넘긴다() throws Exception {
		when(service.getArticle(eq("support"), eq("nexa/guides/add-nexa-discord-bot")))
			.thenReturn(new PublicContentArticleResponse(detail()));

		mockMvc.perform(get("/api/v1/content/support/nexa/guides/add-nexa-discord-bot"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.article.bodyMarkdown").value("본문입니다."))
			.andExpect(jsonPath("$.article.sourcePaths").doesNotExist());
	}

	@Test
	void sitemap은채널단위로반환한다() throws Exception {
		when(service.getSitemap(eq("support"))).thenReturn(
			new PublicContentSitemapResponse(List.of(
				new PublicContentSitemapEntryDto(
					"https://support.yeon.world",
					"2026-06-17T00:00:00.000Z",
					"weekly",
					0.7
				)
			))
		);

		mockMvc.perform(get("/api/v1/content/support/sitemap"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.entries[0].url").value("https://support.yeon.world"));
	}

	@Test
	void snapshot은세필터를모두서비스로넘긴다() throws Exception {
		when(service.getSnapshot(eq("support"), eq("nexa"), eq("guides")))
			.thenReturn(new PublicContentSnapshotResponse(
				List.of(detail())
			));

		mockMvc.perform(get("/api/v1/content/snapshot")
				.param("channel", "support")
				.param("serviceKey", "nexa")
				.param("category", "guides"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.articles[0].serviceKey").value("nexa"));
	}

	@Test
	void 보관글redirect를반환한다() throws Exception {
		when(service.getArchivedRedirect(eq("blog"), eq("engineering/old-article")))
			.thenReturn(new PublicContentRedirectResponse(
				"https://blog.yeon.world/product/new-article"
			));

		mockMvc.perform(get("/api/v1/content/blog/redirect")
				.param("slug", "engineering/old-article"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.redirectTo")
				.value("https://blog.yeon.world/product/new-article"));
	}

	@Test
	void 없는글은404를반환한다() throws Exception {
		when(service.getArticle(eq("support"), eq("nexa/guides/missing")))
			.thenThrow(new PublicContentServiceException(
				404,
				"PUBLIC_CONTENT_NOT_FOUND",
				"공개 콘텐츠 글을 찾을 수 없습니다."
			));

		mockMvc.perform(get("/api/v1/content/support/nexa/guides/missing"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("PUBLIC_CONTENT_NOT_FOUND"));
	}

	private PublicContentArticleSummaryDto summary() {
		return new PublicContentArticleSummaryDto(
			"support",
			"nexa",
			"guides",
			"nexa/guides/add-nexa-discord-bot",
			"디스코드 서버에 NEXA AI 봇 추가하는 방법",
			"설명입니다.",
			"요약입니다.",
			"https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
			"2026-06-17T00:00:00.000Z",
			"2026-06-17T00:00:00.000Z",
			4
		);
	}

	private PublicContentArticleDetailDto detail() {
		return new PublicContentArticleDetailDto(
			"support",
			"nexa",
			"guides",
			"nexa/guides/add-nexa-discord-bot",
			"디스코드 서버에 NEXA AI 봇 추가하는 방법",
			"설명입니다.",
			"요약입니다.",
			"https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
			"2026-06-17T00:00:00.000Z",
			"2026-06-17T00:00:00.000Z",
			4,
			"markdown",
			"본문입니다.",
			"권한 가이드 보기",
			"/nexa/guides/discord-bot-permissions",
			"NEXA 설치 가이드",
			"검색 설명입니다.",
			"https://cdn.yeon.world/public-content/nexa-guide.png"
		);
	}
}
