package world.yeon.backend.public_content.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(
	prefix = "public-content",
	name = "store",
	havingValue = "seed",
	matchIfMissing = true
)
public class PublicContentSeedRepository implements PublicContentArticleStore {
	private final List<PublicContentArticleRecord> articles;

	public PublicContentSeedRepository(
		ObjectMapper objectMapper,
		@Value("classpath:public-content/articles.json") Resource articlesResource
	) {
		this.articles = loadArticles(objectMapper, articlesResource);
	}

	@Override
	public List<PublicContentArticleRecord> findAll() {
		return articles;
	}

	private List<PublicContentArticleRecord> loadArticles(
		ObjectMapper objectMapper,
		Resource articlesResource
	) {
		try (var inputStream = articlesResource.getInputStream()) {
			var file = objectMapper.readValue(inputStream, PublicContentSeedFile.class);
			if (file.articles() == null || file.articles().isEmpty()) {
				throw new IllegalStateException("공개 콘텐츠 seed가 비어 있습니다.");
			}
			ensureUniqueSlugs(file.articles());
			return List.copyOf(file.articles());
		} catch (IOException error) {
			throw new IllegalStateException("공개 콘텐츠 seed를 읽지 못했습니다.", error);
		}
	}

	private void ensureUniqueSlugs(List<PublicContentArticleRecord> articles) {
		Set<String> articleKeys = new HashSet<>();
		for (var article : articles) {
			String key = article.channel() + "/" + article.slug();
			if (!articleKeys.add(key)) {
				throw new IllegalStateException("중복된 공개 콘텐츠 slug가 있습니다: " + key);
			}
		}
	}

	private record PublicContentSeedFile(List<PublicContentArticleRecord> articles) {}
}
