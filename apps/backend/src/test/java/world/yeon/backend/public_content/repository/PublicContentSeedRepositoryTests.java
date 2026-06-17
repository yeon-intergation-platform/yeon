package world.yeon.backend.public_content.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

class PublicContentSeedRepositoryTests {
	@Test
	void seedResource를읽고로컬소스경로는포함하지않는다() {
		var repository = new PublicContentSeedRepository(
			new ObjectMapper(),
			new ClassPathResource("public-content/articles.json")
		);

		var articles = repository.findAll();

		assertThat(articles).hasSize(33);
		assertThat(articles)
			.extracting(PublicContentArticleRecord::slug)
			.contains("nexa/guides/add-nexa-discord-bot");
		assertThat(articles)
			.extracting(PublicContentArticleRecord::bodyMarkdown)
			.noneMatch(body -> body.contains("/Users/osuma"));
	}
}
