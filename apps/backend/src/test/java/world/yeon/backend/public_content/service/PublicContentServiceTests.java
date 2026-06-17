package world.yeon.backend.public_content.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import world.yeon.backend.public_content.repository.PublicContentSeedRepository;
import world.yeon.backend.public_content.repository.PublicContentSeedRepository.PublicContentSeedArticle;

@ExtendWith(MockitoExtension.class)
class PublicContentServiceTests {
	@Mock private PublicContentSeedRepository repository;
	private PublicContentService service;

	@BeforeEach
	void setUp() {
		service = new PublicContentService(repository);
	}

	@Test
	void listArticles는채널서비스분류로필터링한다() {
		when(repository.findAll()).thenReturn(List.of(
			article("support", "nexa", "guides", "nexa/guides/add-nexa-discord-bot"),
			article("support", "card", "guides", "card/guides/create-flashcard-deck"),
			article("blog", "nexa", "engineering", "engineering/nexa-architecture")
		));

		var response = service.listArticles("support", "nexa", "guides");

		assertThat(response.articles()).hasSize(1);
		assertThat(response.articles().getFirst().slug())
			.isEqualTo("nexa/guides/add-nexa-discord-bot");
	}

	@Test
	void detail은본문과cta를반환한다() {
		when(repository.findAll()).thenReturn(List.of(
			article("support", "nexa", "troubleshooting", "nexa/troubleshooting/bot-not-responding")
		));

		var response = service.getArticle(
			"support",
			"nexa/troubleshooting/bot-not-responding"
		);

		assertThat(response.article().bodyMarkdown()).contains("본문입니다.");
		assertThat(response.article().ctaHref()).isEqualTo("/nexa/guides/discord-bot-permissions");
	}

	@Test
	void sitemap은채널홈과글url을반환한다() {
		when(repository.findAll()).thenReturn(List.of(
			article("support", "nexa", "guides", "nexa/guides/add-nexa-discord-bot")
		));

		var response = service.getSitemap("support");

		assertThat(response.entries()).hasSize(2);
		assertThat(response.entries().getFirst().url()).isEqualTo("https://support.yeon.world");
		assertThat(response.entries().get(1).changeFrequency()).isEqualTo("monthly");
	}

	@Test
	void 없는글은404서비스오류를던진다() {
		when(repository.findAll()).thenReturn(List.of());

		assertThatThrownBy(() -> service.getArticle("support", "nexa/guides/missing"))
			.isInstanceOf(PublicContentServiceException.class)
			.extracting("status")
			.isEqualTo(404);
	}

	@Test
	void 잘못된필터는badRequest오류를던진다() {
		assertThatThrownBy(() -> service.listArticles("support", "unknown", null))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("지원하지 않는 공개 콘텐츠 서비스입니다.");
	}

	private PublicContentSeedArticle article(
		String channel,
		String serviceKey,
		String category,
		String slug
	) {
		return new PublicContentSeedArticle(
			channel,
			serviceKey,
			category,
			slug,
			"테스트 공개 콘텐츠",
			"설명입니다.",
			"요약입니다.",
			"https://" + channel + ".yeon.world/" + slug,
			"2026-06-17T00:00:00.000Z",
			"2026-06-17T00:00:00.000Z",
			4,
			"markdown",
			"본문입니다.",
			"권한 가이드 보기",
			"/nexa/guides/discord-bot-permissions"
		);
	}
}
