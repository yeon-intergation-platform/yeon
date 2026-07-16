package world.yeon.backend.public_content.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.springframework.stereotype.Component;
import world.yeon.backend.public_content.repository.PublicContentAdminArticleRecord;

@Component
public class PublicContentMarkdownExporter {
	private static final String MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";
	private static final String ZIP_CONTENT_TYPE = "application/zip";

	public PublicContentExportFile markdown(PublicContentAdminArticleRecord article) {
		return new PublicContentExportFile(
			filename(article),
			MARKDOWN_CONTENT_TYPE,
			toMarkdown(article).getBytes(StandardCharsets.UTF_8)
		);
	}

	public PublicContentExportFile zip(
		List<PublicContentAdminArticleRecord> articles,
		String channel
	) {
		String filename = channel == null
			? "yeon-public-content-all.zip"
			: "yeon-public-content-" + channel + ".zip";
		try {
			var output = new ByteArrayOutputStream();
			try (var zip = new ZipOutputStream(output, StandardCharsets.UTF_8)) {
				for (var article : articles.stream()
					.sorted(Comparator.comparing(PublicContentAdminArticleRecord::channel)
						.thenComparing(PublicContentAdminArticleRecord::slug))
					.toList()) {
					zip.putNextEntry(new ZipEntry(filename(article)));
					zip.write(toMarkdown(article).getBytes(StandardCharsets.UTF_8));
					zip.closeEntry();
				}
			}
			return new PublicContentExportFile(filename, ZIP_CONTENT_TYPE, output.toByteArray());
		} catch (IOException error) {
			throw new IllegalStateException("공개 콘텐츠 ZIP export를 만들지 못했습니다.", error);
		}
	}

	String toMarkdown(PublicContentAdminArticleRecord article) {
		var frontmatter = new StringBuilder()
			.append("---\n")
			.append(field("schema_version", "1"))
			.append(field("title", article.title()))
			.append(field("description", article.description()))
			.append(field("summary", article.summary()))
			.append(field("channel", article.channel()))
			.append(field("service", article.serviceKey()))
			.append(field("category", article.category()))
			.append(field("slug", article.slug()))
			.append(field("status", article.status()))
			.append(field("visibility", article.visibility()))
			.append(field("noindex", Boolean.toString(article.noindex())))
			.append(optionalField("meta_title", article.metaTitle()))
			.append(optionalField("meta_description", article.metaDescription()))
			.append(optionalField("og_image_url", article.ogImageUrl()))
			.append(optionalField("cta_label", article.ctaLabel()))
			.append(optionalField("cta_href", article.ctaHref()))
			.append(field("author_key", article.authorKey()))
			.append(field("source_repo", article.sourceRepo() == null ? "yeon" : article.sourceRepo()));

		if (article.sourcePaths().isEmpty()) {
			frontmatter.append("source_path: []\n");
		} else {
			frontmatter.append("source_path:\n");
			for (String sourcePath : article.sourcePaths()) {
				frontmatter.append("  - ").append(quote(sourcePath)).append("\n");
			}
		}
		frontmatter
			.append(optionalField("redirect_to", article.redirectTo()))
			.append(field("content_version", Long.toString(article.version())))
			.append("---\n\n")
			.append(article.bodyMarkdown().trim())
			.append("\n");
		return frontmatter.toString();
	}

	private String filename(PublicContentAdminArticleRecord article) {
		return article.channel() + "-" + article.serviceKey() + "-" + article.category() +
			"-" + article.slug().replace("/", "--") + ".md";
	}

	private String optionalField(String key, String value) {
		return value == null || value.isBlank() ? "" : field(key, value);
	}

	private String field(String key, String value) {
		return key + ": " + quote(value) + "\n";
	}

	private String quote(String value) {
		return "\"" + value
			.replace("\\", "\\\\")
			.replace("\"", "\\\"")
			.replace("\r", "\\r")
			.replace("\n", "\\n") + "\"";
	}
}
