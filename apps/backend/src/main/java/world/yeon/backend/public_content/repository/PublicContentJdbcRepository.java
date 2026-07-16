package world.yeon.backend.public_content.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@ConditionalOnProperty(prefix = "public-content", name = "store", havingValue = "jdbc")
public class PublicContentJdbcRepository implements
	PublicContentArticleStore,
	PublicContentAdminArticleStore {
	private static final TypeReference<List<String>> SOURCE_PATHS_TYPE =
		new TypeReference<>() {};

	private static final String ADMIN_COLUMNS = """
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
		redirect_to,
		version,
		published_revision_id::text as published_revision_id
		""";

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
			  revision.channel,
			  revision.service_key,
			  revision.category,
			  revision.slug,
			  revision.title,
			  revision.description,
			  revision.summary,
			  revision.canonical_url,
			  revision.published_at,
			  revision.created_at as updated_at,
			  revision.reading_minutes,
			  revision.body_format,
			  revision.body_markdown,
			  revision.cta_label,
			  revision.cta_href,
			  revision.meta_title,
			  revision.meta_description,
			  revision.og_image_url,
			  revision.source_paths::text as source_paths
			from public.public_content_articles article
			join public.public_content_article_revisions revision
			  on revision.id = article.published_revision_id
			where article.status <> 'archived'
			  and revision.visibility = 'public'
			  and revision.noindex = false
			order by revision.published_at desc, revision.slug asc
			""", this::mapArticle);
	}

	@Override
	public Optional<String> findArchivedRedirect(String channel, String slug) {
		return jdbc.queryForList("""
			select redirect_to
			from public.public_content_articles
			where channel = ?
			  and slug = ?
			  and status = 'archived'
			  and redirect_to is not null
			  and btrim(redirect_to) <> ''
			limit 1
			""", String.class, channel, slug).stream().findFirst();
	}

	@Override
	public List<PublicContentAdminArticleRecord> findAllForAdmin() {
		return jdbc.query(
			"select " + ADMIN_COLUMNS + " from public.public_content_articles " +
				"order by updated_at desc, slug asc",
			this::mapAdminArticle
		);
	}

	@Override
	public Optional<PublicContentAdminArticleRecord> findForAdmin(String articleId) {
		return jdbc.query(
			"select " + ADMIN_COLUMNS +
				" from public.public_content_articles where id::text = ?",
			this::mapAdminArticle,
			articleId
		).stream().findFirst();
	}

	@Override
	@Transactional
	public PublicContentAdminArticleRecord create(
		PublicContentArticleDraft draft,
		UUID actorId
	) {
		try {
			String articleId = jdbc.queryForObject("""
				insert into public.public_content_articles (
				  channel, service_key, category, slug, title, description, summary,
				  canonical_url, reading_minutes, body_format, body_markdown,
				  visibility, noindex, meta_title, meta_description, og_image_url,
				  cta_label, cta_href, author_key, source_repo, source_paths,
				  redirect_to, status, created_by, updated_by
				) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, 'draft', ?, ?)
				returning id::text
				""",
				String.class,
				draft.channel(),
				draft.serviceKey(),
				draft.category(),
				draft.slug(),
				draft.title(),
				draft.description(),
				draft.summary(),
				draft.canonicalUrl(),
				draft.readingMinutes(),
				draft.bodyFormat(),
				draft.bodyMarkdown(),
				draft.visibility(),
				draft.noindex(),
				draft.metaTitle(),
				draft.metaDescription(),
				draft.ogImageUrl(),
				draft.ctaLabel(),
				draft.ctaHref(),
				draft.authorKey(),
				draft.sourceRepo(),
				toJson(draft.sourcePaths()),
				draft.redirectTo(),
				actorId,
				actorId
			);

			return requireArticle(articleId);
		} catch (DataIntegrityViolationException error) {
			throw new PublicContentStoreConflictException(
				"같은 채널에 이미 사용 중인 slug가 있습니다."
			);
		}
	}

	@Override
	@Transactional
	public PublicContentAdminArticleRecord update(
		String articleId,
		PublicContentArticleDraft draft,
		long expectedVersion,
		UUID actorId
	) {
		try {
			int updated = jdbc.update("""
				update public.public_content_articles
				set channel = ?,
				    service_key = ?,
				    category = ?,
				    slug = ?,
				    title = ?,
				    description = ?,
				    summary = ?,
				    canonical_url = ?,
				    reading_minutes = ?,
				    body_format = ?,
				    body_markdown = ?,
				    visibility = ?,
				    noindex = ?,
				    meta_title = ?,
				    meta_description = ?,
				    og_image_url = ?,
				    cta_label = ?,
				    cta_href = ?,
				    author_key = ?,
				    source_repo = ?,
				    source_paths = ?::jsonb,
				    redirect_to = ?,
				    status = case when status in ('review', 'published') then 'draft' else status end,
				    updated_by = ?,
				    updated_at = now(),
				    version = version + 1
				where id::text = ?
				  and version = ?
				  and status <> 'archived'
				""",
				draft.channel(),
				draft.serviceKey(),
				draft.category(),
				draft.slug(),
				draft.title(),
				draft.description(),
				draft.summary(),
				draft.canonicalUrl(),
				draft.readingMinutes(),
				draft.bodyFormat(),
				draft.bodyMarkdown(),
				draft.visibility(),
				draft.noindex(),
				draft.metaTitle(),
				draft.metaDescription(),
				draft.ogImageUrl(),
				draft.ctaLabel(),
				draft.ctaHref(),
				draft.authorKey(),
				draft.sourceRepo(),
				toJson(draft.sourcePaths()),
				draft.redirectTo(),
				actorId,
				articleId,
				expectedVersion
			);
			requireUpdated(updated);
			return requireArticle(articleId);
		} catch (DataIntegrityViolationException error) {
			throw new PublicContentStoreConflictException(
				"같은 채널에 이미 사용 중인 slug가 있습니다."
			);
		}
	}

	@Override
	@Transactional
	public PublicContentAdminArticleRecord requestReview(
		String articleId,
		long expectedVersion,
		UUID actorId
	) {
		return transition(articleId, expectedVersion, actorId, "draft", "review", false);
	}

	@Override
	@Transactional
	public PublicContentAdminArticleRecord publish(
		String articleId,
		long expectedVersion,
		UUID actorId
	) {
		var article = findForAdminForUpdate(articleId);
		requireVersionAndStatus(article, expectedVersion, "review");

		int revisionNumber = jdbc.queryForObject(
			"select coalesce(max(revision_number), 0) + 1 " +
				"from public.public_content_article_revisions where article_id = ?::bigint",
			Integer.class,
			articleId
		);
		var revision = insertRevision(article, revisionNumber, actorId, null, null);

		int updated = jdbc.update("""
			update public.public_content_articles
			set status = 'published',
			    published_revision_id = ?::bigint,
			    published_at = ?::timestamptz,
			    updated_by = ?,
			    updated_at = now(),
			    version = version + 1
			where id::text = ? and version = ? and status = 'review'
			""",
			revision.id(),
			revision.publishedAt(),
			actorId,
			articleId,
			expectedVersion
		);
		requireUpdated(updated);
		return requireArticle(articleId);
	}

	@Override
	@Transactional
	public PublicContentAdminArticleRecord archive(
		String articleId,
		long expectedVersion,
		UUID actorId
	) {
		return transition(articleId, expectedVersion, actorId, null, "archived", true);
	}

	@Override
	@Transactional
	public PublicContentAdminArticleRecord restore(
		String articleId,
		long expectedVersion,
		UUID actorId
	) {
		return transition(articleId, expectedVersion, actorId, "archived", "draft", false);
	}

	@Override
	@Transactional
	public void delete(String articleId, long expectedVersion) {
		int deleted = jdbc.update("""
			delete from public.public_content_articles article
			where article.id::text = ?
			  and article.version = ?
			  and article.status = 'draft'
			  and article.published_revision_id is null
			  and not exists (
			    select 1 from public.public_content_article_revisions revision
			    where revision.article_id = article.id
			  )
			""", articleId, expectedVersion);
		requireUpdated(deleted);
	}

	@Override
	public List<PublicContentRevisionRecord> findRevisions(String articleId) {
		return jdbc.query("""
			select
			  id::text as id,
			  article_id::text as article_id,
			  revision_number,
			  title,
			  body_markdown,
			  published_at,
			  created_by::text as created_by
			from public.public_content_article_revisions
			where article_id::text = ?
			order by revision_number desc
			""", this::mapRevision, articleId);
	}

	@Transactional
	public int seedMissingPublishedArticles(List<PublicContentArticleRecord> articles) {
		int insertedCount = 0;
		for (var article : articles) {
			List<String> insertedIds = jdbc.query("""
				insert into public.public_content_articles (
				  channel, service_key, category, slug, title, description, summary,
				  canonical_url, published_at, reading_minutes, body_format, body_markdown,
				  status, visibility, noindex, meta_description, cta_label, cta_href,
				  author_key, source_repo, source_paths, updated_at, created_at
				) values (?, ?, ?, ?, ?, ?, ?, ?, ?::timestamptz, ?, ?, ?, 'published',
				  'public', false, ?, ?, ?, 'yeon', 'yeon', ?::jsonb, ?::timestamptz, ?::timestamptz)
				on conflict (channel, slug) do nothing
				returning id::text
				""",
				(rs, rowNum) -> rs.getString(1),
				article.channel(),
				article.serviceKey(),
				article.category(),
				article.slug(),
				article.title(),
				article.description(),
				article.summary(),
				article.canonicalUrl(),
				article.publishedAt(),
				article.readingMinutes(),
				article.bodyFormat(),
				article.bodyMarkdown(),
				article.metaDescription(),
				article.ctaLabel(),
				article.ctaHref(),
				toJson(article.sourcePaths()),
				article.updatedAt(),
				article.publishedAt()
			);
			if (insertedIds.isEmpty()) {
				continue;
			}

			String articleId = insertedIds.getFirst();
			var created = requireArticle(articleId);
			var revision = insertRevision(
				created,
				1,
				null,
				article.publishedAt(),
				article.updatedAt()
			);
			jdbc.update("""
				update public.public_content_articles
				set published_revision_id = ?::bigint
				where id::text = ?
				""", revision.id(), articleId);
			insertedCount += 1;
		}
		return insertedCount;
	}

	private PublicContentAdminArticleRecord transition(
		String articleId,
		long expectedVersion,
		UUID actorId,
		String requiredStatus,
		String nextStatus,
		boolean clearPublishedRevision
	) {
		String statusCondition = requiredStatus == null ? "status <> 'archived'" : "status = ?";
		String sql = "update public.public_content_articles " +
			"set status = ?, published_revision_id = " +
			(clearPublishedRevision ? "null" : "published_revision_id") +
			", updated_by = ?, updated_at = now(), version = version + 1 " +
			"where id::text = ? and version = ? and " + statusCondition;

		int updated = requiredStatus == null
			? jdbc.update(sql, nextStatus, actorId, articleId, expectedVersion)
			: jdbc.update(sql, nextStatus, actorId, articleId, expectedVersion, requiredStatus);
		requireUpdated(updated);
		return requireArticle(articleId);
	}

	private PublicContentRevisionRecord insertRevision(
		PublicContentAdminArticleRecord article,
		int revisionNumber,
		UUID actorId,
		String publishedAtOverride,
		String createdAtOverride
	) {
		return jdbc.queryForObject("""
			insert into public.public_content_article_revisions (
			  article_id, revision_number, channel, service_key, category, slug,
			  title, description, summary, canonical_url, reading_minutes,
			  body_format, body_markdown, visibility, noindex, meta_title,
			  meta_description, og_image_url, cta_label, cta_href, author_key,
			  source_repo, source_paths, redirect_to, published_at, created_by, created_at
			) values (?::bigint, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?,
			  coalesce(?::timestamptz, now()), ?, coalesce(?::timestamptz, now()))
			returning id::text as id, article_id::text as article_id, revision_number,
			  title, body_markdown, published_at, created_by::text as created_by
			""",
			this::mapRevision,
			article.id(),
			revisionNumber,
			article.channel(),
			article.serviceKey(),
			article.category(),
			article.slug(),
			article.title(),
			article.description(),
			article.summary(),
			article.canonicalUrl(),
			article.readingMinutes(),
			article.bodyFormat(),
			article.bodyMarkdown(),
			article.visibility(),
			article.noindex(),
			article.metaTitle(),
			article.metaDescription(),
			article.ogImageUrl(),
			article.ctaLabel(),
			article.ctaHref(),
			article.authorKey(),
			article.sourceRepo(),
			toJson(article.sourcePaths()),
			article.redirectTo(),
			publishedAtOverride,
			actorId,
			createdAtOverride
		);
	}

	private PublicContentAdminArticleRecord findForAdminForUpdate(String articleId) {
		return jdbc.query(
			"select " + ADMIN_COLUMNS +
				" from public.public_content_articles where id::text = ? for update",
			this::mapAdminArticle,
			articleId
		).stream().findFirst().orElseThrow(() ->
			new PublicContentStoreConflictException("관리 대상 글을 찾을 수 없습니다."));
	}

	private PublicContentAdminArticleRecord requireArticle(String articleId) {
		return findForAdmin(articleId).orElseThrow(() ->
			new IllegalStateException("저장한 공개 콘텐츠 글을 다시 찾지 못했습니다."));
	}

	private void requireVersionAndStatus(
		PublicContentAdminArticleRecord article,
		long expectedVersion,
		String requiredStatus
	) {
		if (article.version() != expectedVersion) {
			throw new PublicContentStoreConflictException(
				"다른 관리자가 먼저 글을 수정했습니다. 최신 내용을 다시 불러와 주세요."
			);
		}
		if (!requiredStatus.equals(article.status())) {
			throw new PublicContentStoreConflictException(
				"현재 글 상태에서는 요청한 작업을 수행할 수 없습니다."
			);
		}
	}

	private void requireUpdated(int updatedRows) {
		if (updatedRows == 0) {
			throw new PublicContentStoreConflictException(
				"글 상태나 버전이 변경되었습니다. 최신 내용을 다시 불러와 주세요."
			);
		}
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
			rs.getString("cta_href"),
			rs.getString("meta_title"),
			rs.getString("meta_description"),
			rs.getString("og_image_url"),
			parseSourcePaths(rs.getString("source_paths"))
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
			rs.getString("redirect_to"),
			rs.getLong("version"),
			rs.getString("published_revision_id")
		);
	}

	private PublicContentRevisionRecord mapRevision(ResultSet rs, int rowNum)
		throws SQLException {
		return new PublicContentRevisionRecord(
			rs.getString("id"),
			rs.getString("article_id"),
			rs.getInt("revision_number"),
			rs.getString("title"),
			rs.getString("body_markdown"),
			toIsoString(rs.getObject("published_at", OffsetDateTime.class)),
			rs.getString("created_by")
		);
	}

	private String toIsoString(OffsetDateTime value) {
		return value == null ? null : value.toInstant().toString();
	}

	private String toJson(List<String> sourcePaths) {
		try {
			return objectMapper.writeValueAsString(sourcePaths);
		} catch (JsonProcessingException error) {
			throw new IllegalArgumentException("공개 콘텐츠 sourcePaths를 JSON으로 만들지 못했습니다.", error);
		}
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
