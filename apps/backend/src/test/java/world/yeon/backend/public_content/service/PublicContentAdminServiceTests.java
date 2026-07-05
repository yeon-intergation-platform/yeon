package world.yeon.backend.public_content.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.public_content.repository.PublicContentAdminArticleRecord;
import world.yeon.backend.public_content.repository.PublicContentArticleStore;
import world.yeon.backend.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PublicContentAdminServiceTests {
	private static final UUID ADMIN_ID = UUID.fromString(
		"00000000-0000-0000-0000-000000000001"
	);
	private static final UUID MEMBER_ID = UUID.fromString(
		"00000000-0000-0000-0000-000000000002"
	);

	@Mock private PublicContentArticleStore repository;
	@Mock private UserRepository userRepository;
	private PublicContentAdminService service;

	@BeforeEach
	void setUp() {
		service = new PublicContentAdminService(repository, userRepository, "");
	}

	@Test
	void admin목록은상태와공개범위까지필터링한다() {
		when(userRepository.findById(ADMIN_ID)).thenReturn(user("admin@yeon.world", "admin"));
		when(repository.findAllForAdmin()).thenReturn(List.of(
			adminArticle("article-1", "support", "nexa", "guides", "published", "public"),
			adminArticle("article-2", "blog", "yeon", "engineering", "draft", "internal")
		));

		var response = service.listArticles(
			ADMIN_ID,
			"blog",
			"yeon",
			"engineering",
			"draft",
			"internal"
		);

		assertThat(response.articles()).hasSize(1);
		assertThat(response.articles().getFirst().id()).isEqualTo("article-2");
		assertThat(response.articles().getFirst().publishedAt()).isNull();
		assertThat(response.articles().getFirst().noindex()).isTrue();
	}

	@Test
	void admin상세는source메타데이터를반환한다() {
		when(userRepository.findById(ADMIN_ID)).thenReturn(user("admin@yeon.world", "admin"));
		when(repository.findAllForAdmin()).thenReturn(List.of(
			adminArticle("article-1", "support", "nexa", "guides", "published", "public")
		));

		var response = service.getArticle(ADMIN_ID, "article-1");

		assertThat(response.article().sourceRepo()).isEqualTo("yeon");
		assertThat(response.article().sourcePaths()).containsExactly("docs/seo/example.md");
	}

	@Test
	void admin권한이없으면403을던진다() {
		when(userRepository.findById(MEMBER_ID)).thenReturn(user("member@yeon.world", "member"));

		assertThatThrownBy(() ->
				service.listArticles(MEMBER_ID, null, null, null, null, null)
			)
			.isInstanceOf(PublicContentServiceException.class)
			.extracting("status")
			.isEqualTo(403);
	}

	@Test
	void 없는admin상세는404를던진다() {
		when(userRepository.findById(ADMIN_ID)).thenReturn(user("admin@yeon.world", "admin"));
		when(repository.findAllForAdmin()).thenReturn(List.of());

		assertThatThrownBy(() -> service.getArticle(ADMIN_ID, "missing"))
			.isInstanceOf(PublicContentServiceException.class)
			.extracting("status")
			.isEqualTo(404);
	}

	private UserRepository.UserRow user(String email, String role) {
		return new UserRepository.UserRow(
			ADMIN_ID.toString(),
			email,
			"관리자",
			role,
			null,
			null,
			null,
			null,
			0,
			List.of(),
			0,
			0
		);
	}

	private PublicContentAdminArticleRecord adminArticle(
		String id,
		String channel,
		String serviceKey,
		String category,
		String status,
		String visibility
	) {
		boolean draft = "draft".equals(status);
		return new PublicContentAdminArticleRecord(
			id,
			channel,
			serviceKey,
			category,
			"engineering/draft-search-console-note",
			"Search Console 초안",
			"설명입니다.",
			"요약입니다.",
			"https://" + channel + ".yeon.world/engineering/draft-search-console-note",
			draft ? null : "2026-06-17T00:00:00Z",
			"2026-06-17T00:00:00Z",
			3,
			"markdown",
			"본문입니다.",
			null,
			null,
			status,
			visibility,
			draft,
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
