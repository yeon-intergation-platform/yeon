package world.yeon.backend.public_content.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.DriverManager;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class PublicContentV22MigrationTests {
	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("public_content_migration_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Test
	void V21의portableText발행글을Markdown리비전으로보존한다() throws Exception {
		flyway(MigrationVersion.fromVersion("21")).migrate();

		try (var connection = DriverManager.getConnection(
			postgres.getJdbcUrl(),
			postgres.getUsername(),
			postgres.getPassword()
		); var statement = connection.createStatement()) {
			statement.executeUpdate("""
				insert into public.public_content_articles (
				  channel, service_key, category, slug, title, description, summary,
				  canonical_url, reading_minutes, body_format, body_markdown,
				  status, visibility, noindex, author_key, published_at
				) values (
				  'blog', 'yeon', 'engineering', 'engineering/legacy-portable-text',
				  '이전 Portable Text', '이전 형식 설명', '이전 형식 요약',
				  'https://blog.yeon.world/engineering/legacy-portable-text',
				  1, 'portable_text', '{"blocks":[{"text":"legacy"}]}',
				  'published', 'public', false, 'yeon', now()
				)
				""");
		}

		flyway(null).migrate();

		try (var connection = DriverManager.getConnection(
			postgres.getJdbcUrl(),
			postgres.getUsername(),
			postgres.getPassword()
		); var statement = connection.createStatement(); var result = statement.executeQuery("""
			select article.body_format as article_body_format,
			       article.body_markdown as article_body_markdown,
			       revision.body_format as revision_body_format,
			       revision.body_markdown as revision_body_markdown,
			       article.published_revision_id
			from public.public_content_articles article
			join public.public_content_article_revisions revision
			  on revision.id = article.published_revision_id
			where article.slug = 'engineering/legacy-portable-text'
			""")) {
			assertThat(result.next()).isTrue();
			assertThat(result.getString("article_body_format")).isEqualTo("markdown");
			assertThat(result.getString("revision_body_format")).isEqualTo("markdown");
			assertThat(result.getString("article_body_markdown"))
				.contains("## 이전 Portable Text 원문")
				.contains("legacy");
			assertThat(result.getString("revision_body_markdown"))
				.contains("## 이전 Portable Text 원문")
				.contains("legacy");
			assertThat(result.getString("published_revision_id")).isNotBlank();
			assertThat(result.next()).isFalse();
		}
	}

	private Flyway flyway(MigrationVersion target) {
		var configuration = Flyway.configure()
			.dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
			.locations("classpath:db/migration")
			.defaultSchema("yeon_backend")
			.schemas("yeon_backend");
		if (target != null) {
			configuration.target(target);
		}
		return configuration.load();
	}
}
