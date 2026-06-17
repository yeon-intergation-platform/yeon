package world.yeon.backend.public_content.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "public-content", name = "store", havingValue = "jdbc")
public class PublicContentJdbcRepository implements PublicContentArticleStore {
	private final JdbcTemplate jdbc;

	public PublicContentJdbcRepository(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Override
	public java.util.List<PublicContentArticleRecord> findAll() {
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

	private String toIsoString(OffsetDateTime value) {
		return value.toInstant().toString();
	}
}
