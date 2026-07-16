package world.yeon.backend.public_content.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnProperty(prefix = "public-content", name = "store", havingValue = "jdbc")
public class PublicContentJdbcBootstrap implements ApplicationRunner {
	private static final Logger log = LoggerFactory.getLogger(PublicContentJdbcBootstrap.class);

	private final PublicContentJdbcRepository repository;
	private final List<PublicContentArticleRecord> seedArticles;

	public PublicContentJdbcBootstrap(
		PublicContentJdbcRepository repository,
		ObjectMapper objectMapper,
		@Value("classpath:public-content/articles.json") Resource articlesResource
	) {
		this.repository = repository;
		this.seedArticles = loadArticles(objectMapper, articlesResource);
	}

	@Override
	public void run(ApplicationArguments args) {
		int insertedCount = repository.seedMissingPublishedArticles(seedArticles);
		if (insertedCount > 0) {
			log.info("공개 콘텐츠 초기 발행본 {}개를 DB에 추가했습니다.", insertedCount);
		}
	}

	private List<PublicContentArticleRecord> loadArticles(
		ObjectMapper objectMapper,
		Resource articlesResource
	) {
		try (var inputStream = articlesResource.getInputStream()) {
			var file = objectMapper.readValue(inputStream, PublicContentSeedFile.class);
			if (file.articles() == null || file.articles().isEmpty()) {
				throw new IllegalStateException("공개 콘텐츠 초기 발행본이 비어 있습니다.");
			}
			return List.copyOf(file.articles());
		} catch (IOException error) {
			throw new IllegalStateException("공개 콘텐츠 초기 발행본을 읽지 못했습니다.", error);
		}
	}

	private record PublicContentSeedFile(List<PublicContentArticleRecord> articles) {}
}
