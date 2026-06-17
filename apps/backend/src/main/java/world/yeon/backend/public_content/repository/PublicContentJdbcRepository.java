package world.yeon.backend.public_content.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "public-content", name = "store", havingValue = "jdbc")
public class PublicContentJdbcRepository implements PublicContentArticleStore {
	private static final TypeReference<List<String>> SOURCE_PATHS_TYPE =
		new TypeReference<>() {};

	private final JdbcTemplate jdbc;
	private final ObjectMapper objectMapper;

	public PublicContentJdbcRepository(JdbcTemplate jdbc, ObjectMapper objectMapper) {
		this.jdbc = jdbc;
		this.objectMapper = objectMapper;
	}

	@Override
	public List<PublicContentArticleRecord> findAll() {
		return jdbc.query("""
			select
			  channel,
			  service_key,
			  category,
			  slug,
			  title,
			  description,
			  summary,
			  canonical_url,
			  published_at,
			  updated_at,
			  reading_minutes,
			  body_format,
			  body_markdown,
			  cta_label,
			  cta_href
			from public.public_content_articles
			where status = 'published'
			  and visibility = 'public'
			  and noindex = false
			  and published_at is not null
			order by published_at desc, slug asc
			""", this::mapArticle);
	}

	@Override
	public List<PublicContentAdminArticleRecord> findAllForAdmin() {
		return jdbc.query("""
			select
			  id::text as id,
			  channel,
			  service_key,
			  category,
			  slug,
			  title,
			  description,
			  summary,
			  canonical_url,
			  published_at,
			  updated_at,
			  reading_minutes,
			  body_format,
			  body_markdown,
			  cta_label,
			  cta_href,
			  status,
			  visibility,
			  noindex,
			  meta_title,
			  meta_description,
			  og_image_url,
			  author_key,
			  source_repo,
			  source_paths::text as source_paths,
			  redirect_to
			from public.public_content_articles
			order by updated_at desc, slug asc
			""", this::mapAdminArticle);
	}

	private PublicContentArticleRecord mapArticle(ResultSet rs, int rowNum)
		throws SQLException {
		return new PublicContentArticleRecord(
			rs.getString("channel"),
			rs.getString("service_key"),
			rs.getString("category"),
			rs.getString("slug"),
			rs.getString("title"),
			rs.getString("description"),
			rs.getString("summary"),
			rs.getString("canonical_url"),
			toIsoString(rs.getObject("published_at", OffsetDateTime.class)),
			toIsoString(rs.getObject("updated_at", OffsetDateTime.class)),
			rs.getInt("reading_minutes"),
			rs.getString("body_format"),
			rs.getString("body_markdown"),
			rs.getString("cta_label"),
			rs.getString("cta_href")
		);
	}

	private PublicContentAdminArticleRecord mapAdminArticle(ResultSet rs, int rowNum)
		throws SQLException {
		return new PublicContentAdminArticleRecord(
			rs.getString("id"),
			rs.getString("channel"),
			rs.getString("service_key"),
			rs.getString("category"),
			rs.getString("slug"),
			rs.getString("title"),
			rs.getString("description"),
			rs.getString("summary"),
			rs.getString("canonical_url"),
			toIsoString(rs.getObject("published_at", OffsetDateTime.class)),
			toIsoString(rs.getObject("updated_at", OffsetDateTime.class)),
			rs.getInt("reading_minutes"),
			rs.getString("body_format"),
			rs.getString("body_markdown"),
			rs.getString("cta_label"),
			rs.getString("cta_href"),
			rs.getString("status"),
			rs.getString("visibility"),
			rs.getBoolean("noindex"),
			rs.getString("meta_title"),
			rs.getString("meta_description"),
			rs.getString("og_image_url"),
			rs.getString("author_key"),
			rs.getString("source_repo"),
			parseSourcePaths(rs.getString("source_paths")),
			rs.getString("redirect_to")
		);
	}

	private String toIsoString(OffsetDateTime value) {
		return value == null ? null : value.toInstant().toString();
	}

	private List<String> parseSourcePaths(String raw) {
		if (raw == null || raw.isBlank()) {
			return List.of();
		}
		try {
			return objectMapper.readValue(raw, SOURCE_PATHS_TYPE);
		} catch (Exception error) {
			throw new IllegalStateException("공개 콘텐츠 source_paths를 해석하지 못했습니다.", error);
		}
	}
}
