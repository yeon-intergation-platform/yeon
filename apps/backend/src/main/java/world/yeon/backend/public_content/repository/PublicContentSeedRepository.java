package world.yeon.backend.public_content.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Repository;

@Repository
public class PublicContentSeedRepository {
	private final List<PublicContentSeedArticle> articles;

	public PublicContentSeedRepository(
		ObjectMapper objectMapper,
		@Value("classpath:public-content/articles.json") Resource articlesResource
	) {
		this.articles = loadArticles(objectMapper, articlesResource);
	}

	public List<PublicContentSeedArticle> findAll() {
		return articles;
	}

	private List<PublicContentSeedArticle> loadArticles(
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

	private void ensureUniqueSlugs(List<PublicContentSeedArticle> articles) {
		Set<String> articleKeys = new HashSet<>();
		for (var article : articles) {
			String key = article.channel() + "/" + article.slug();
			if (!articleKeys.add(key)) {
				throw new IllegalStateException("중복된 공개 콘텐츠 slug가 있습니다: " + key);
			}
		}
	}

	private record PublicContentSeedFile(List<PublicContentSeedArticle> articles) {}

	public record PublicContentSeedArticle(
		String channel,
		String serviceKey,
		String category,
		String slug,
		String title,
		String description,
		String summary,
		String canonicalUrl,
		String publishedAt,
		String updatedAt,
		int readingMinutes,
		String bodyFormat,
		String bodyMarkdown,
		String ctaLabel,
		String ctaHref
	) {}
}
