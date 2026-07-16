package world.yeon.backend.public_content.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class PublicContentJdbcRepositoryIntegrationTests {
	private static final UUID ACTOR_ID = UUID.fromString(
		"00000000-0000-0000-0000-000000000716"
	);

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired private PublicContentJdbcRepository repository;

	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add(
			"DATABASE_URL",
			() ->
				"postgresql://" +
				postgres.getUsername() +
				":" +
				postgres.getPassword() +
				"@" +
				postgres.getHost() +
				":" +
				postgres.getFirstMappedPort() +
				"/" +
				postgres.getDatabaseName()
		);
		registry.add("public-content.store", () -> "jdbc");
	}

	@Test
	void 발행본은원고수정과분리되고재발행과보관시에만바뀐다() {
		var created = repository.create(draft("초기 공개 본문"), ACTOR_ID);
		var reviewed = repository.requestReview(created.id(), created.version(), ACTOR_ID);
		var firstPublished = repository.publish(
			reviewed.id(),
			reviewed.version(),
			ACTOR_ID
		);

		assertThat(findPublicBody(firstPublished.slug())).isEqualTo("초기 공개 본문");

		var edited = repository.update(
			firstPublished.id(),
			draft("수정 중인 비공개 원고"),
			firstPublished.version(),
			ACTOR_ID
		);

		assertThat(edited.status()).isEqualTo("draft");
		assertThat(findPublicBody(edited.slug())).isEqualTo("초기 공개 본문");

		var secondReview = repository.requestReview(
			edited.id(),
			edited.version(),
			ACTOR_ID
		);
		var secondPublished = repository.publish(
			secondReview.id(),
			secondReview.version(),
			ACTOR_ID
		);

		assertThat(findPublicBody(secondPublished.slug()))
			.isEqualTo("수정 중인 비공개 원고");
		assertThat(repository.findRevisions(secondPublished.id()))
			.extracting(PublicContentRevisionRecord::revisionNumber)
			.containsExactly(2, 1);

		var archived = repository.archive(
			secondPublished.id(),
			secondPublished.version(),
			ACTOR_ID
		);

		assertThat(archived.status()).isEqualTo("archived");
		assertThat(findPublicBody(archived.slug())).isNull();
		assertThat(repository.findArchivedRedirect("blog", archived.slug()))
			.contains("https://blog.yeon.world/product/replacement-article");
	}

	private String findPublicBody(String slug) {
		return repository.findAll().stream()
			.filter(article -> article.slug().equals(slug))
			.map(PublicContentArticleRecord::bodyMarkdown)
			.findFirst()
			.orElse(null);
	}

	private PublicContentArticleDraft draft(String bodyMarkdown) {
		return new PublicContentArticleDraft(
			"blog",
			"yeon",
			"engineering",
			"engineering/revision-pointer-integration-test",
			"공개 콘텐츠 리비전 포인터 통합 테스트",
			"발행 원고와 공개 리비전이 분리되는지 확인합니다.",
			"초안 수정과 공개본 교체 시점을 검증합니다.",
			"https://blog.yeon.world/engineering/revision-pointer-integration-test",
			2,
			"markdown",
			bodyMarkdown,
			null,
			null,
			"public",
			false,
			null,
			"발행 원고와 공개 리비전 분리를 검증합니다.",
			null,
			"yeon",
			"yeon",
			List.of("apps/backend"),
			"https://blog.yeon.world/product/replacement-article"
		);
	}
}
