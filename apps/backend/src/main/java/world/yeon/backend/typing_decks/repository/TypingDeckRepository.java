package world.yeon.backend.typing_decks.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.common.repository.NativeQueryValue;

@Repository
public class TypingDeckRepository {
	public record TypingDeckRow(
		Long internalId,
		String publicId,
		String ownerUserId,
		String title,
		String description,
		String languageTag,
		String visibility,
		String source,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	public record TypingDeckListRow(
		Long internalId,
		String publicId,
		String ownerUserId,
		String title,
		String description,
		String languageTag,
		String visibility,
		String source,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt,
		int passageCount
	) {}

	public record TypingDeckPassageRow(
		Long internalId,
		String publicId,
		Long deckId,
		String title,
		String prompt,
		String textType,
		String difficulty,
		int sortOrder,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	private final EntityManager entityManager;
	private final TypingDeckRowMapper rowMapper;

	public TypingDeckRepository(EntityManager entityManager, TypingDeckRowMapper rowMapper) {
		this.entityManager = entityManager;
		this.rowMapper = rowMapper;
	}

	public List<TypingDeckListRow> listDecks(UUID currentUserId, String scope, String languageTag, boolean adminMode) {
		StringBuilder sql = new StringBuilder("""
			select d.id, d.public_id, d.owner_user_id, d.title, d.description, d.language_tag, d.visibility, d.source, d.created_at, d.updated_at,
			       count(p.id)::int as passage_count
			from public.typing_decks d
			left join public.typing_deck_passages p on p.deck_id = d.id
			where 1=1
		""");
		List<SqlParam> params = new ArrayList<>();
		appendLanguageClause(sql, params, languageTag);
		appendScopeClause(sql, params, currentUserId, scope, adminMode);
		sql.append(" group by d.id order by d.created_at desc");
		var query = entityManager.createNativeQuery(sql.toString());
		bind(query, params);
		return query.getResultList().stream().map(rowMapper::toTypingDeckListRow).toList();
	}

	public TypingDeckRow findDeckByPublicId(String deckPublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, public_id, owner_user_id, title, description, language_tag, visibility, source, created_at, updated_at
			from public.typing_decks
			where public_id = :deckPublicId
			limit 1
		""").setParameter("deckPublicId", deckPublicId).getResultList();
		return rows.isEmpty() ? null : rowMapper.toTypingDeckRow(rows.getFirst());
	}

	public List<TypingDeckPassageRow> listPassagesByDeckId(Long deckId) {
		return entityManager.createNativeQuery("""
			select id, public_id, deck_id, title, prompt, text_type, difficulty, sort_order, created_at, updated_at
			from public.typing_deck_passages
			where deck_id = :deckId
			order by sort_order asc, created_at asc
		""").setParameter("deckId", deckId).getResultList().stream().map(rowMapper::toTypingDeckPassageRow).toList();
	}

	public TypingDeckPassageRow findPassageByPublicIdAndDeckId(String passagePublicId, Long deckId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, public_id, deck_id, title, prompt, text_type, difficulty, sort_order, created_at, updated_at
			from public.typing_deck_passages
			where public_id = :passagePublicId and deck_id = :deckId
			limit 1
		""").setParameter("passagePublicId", passagePublicId).setParameter("deckId", deckId).getResultList();
		return rows.isEmpty() ? null : rowMapper.toTypingDeckPassageRow(rows.getFirst());
	}

	public int countPassages(Long deckId) {
		Object value = entityManager.createNativeQuery("select count(id)::int from public.typing_deck_passages where deck_id = :deckId")
			.setParameter("deckId", deckId)
			.getSingleResult();
		return new NativeQueryValue(value, "typing passage count").asInt();
	}

	@Transactional
	public TypingDeckRow insertDeck(String publicId, UUID ownerUserId, String title, String description, String languageTag, String visibility, String source, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.typing_decks (public_id, owner_user_id, title, description, language_tag, visibility, source, created_at, updated_at)
			values (:publicId, :ownerUserId, :title, :description, :languageTag, :visibility, :source, :createdAt, :updatedAt)
			returning id, public_id, owner_user_id, title, description, language_tag, visibility, source, created_at, updated_at
		""")
			.setParameter("publicId", publicId)
			.setParameter("ownerUserId", ownerUserId)
			.setParameter("title", title)
			.setParameter("description", description)
			.setParameter("languageTag", languageTag)
			.setParameter("visibility", visibility)
			.setParameter("source", source)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : rowMapper.toTypingDeckRow(rows.getFirst());
	}

	@Transactional
	public TypingDeckRow updateDeck(Long internalId, String title, String description, String languageTag, String visibility, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.typing_decks
			set title = :title,
			    description = :description,
			    language_tag = :languageTag,
			    visibility = :visibility,
			    updated_at = :updatedAt
			where id = :internalId
			returning id, public_id, owner_user_id, title, description, language_tag, visibility, source, created_at, updated_at
		""")
			.setParameter("internalId", internalId)
			.setParameter("title", title)
			.setParameter("description", description)
			.setParameter("languageTag", languageTag)
			.setParameter("visibility", visibility)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : rowMapper.toTypingDeckRow(rows.getFirst());
	}

	@Transactional
	public boolean deleteDeck(Long internalId) {
		int updated = entityManager.createNativeQuery("delete from public.typing_decks where id = :internalId")
			.setParameter("internalId", internalId)
			.executeUpdate();
		return updated > 0;
	}

	@Transactional
	public TypingDeckPassageRow insertPassage(String publicId, Long deckId, String title, String prompt, String textType, String difficulty, int sortOrder, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.typing_deck_passages (public_id, deck_id, title, prompt, text_type, difficulty, sort_order, created_at, updated_at)
			values (:publicId, :deckId, :title, :prompt, :textType, :difficulty, :sortOrder, :createdAt, :updatedAt)
			returning id, public_id, deck_id, title, prompt, text_type, difficulty, sort_order, created_at, updated_at
		""")
			.setParameter("publicId", publicId)
			.setParameter("deckId", deckId)
			.setParameter("title", title)
			.setParameter("prompt", prompt)
			.setParameter("textType", textType)
			.setParameter("difficulty", difficulty)
			.setParameter("sortOrder", sortOrder)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : rowMapper.toTypingDeckPassageRow(rows.getFirst());
	}

	@Transactional
	public TypingDeckPassageRow updatePassage(Long internalId, String title, String prompt, String textType, String difficulty, int sortOrder, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.typing_deck_passages
			set title = :title,
			    prompt = :prompt,
			    text_type = :textType,
			    difficulty = :difficulty,
			    sort_order = :sortOrder,
			    updated_at = :updatedAt
			where id = :internalId
			returning id, public_id, deck_id, title, prompt, text_type, difficulty, sort_order, created_at, updated_at
		""")
			.setParameter("internalId", internalId)
			.setParameter("title", title)
			.setParameter("prompt", prompt)
			.setParameter("textType", textType)
			.setParameter("difficulty", difficulty)
			.setParameter("sortOrder", sortOrder)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : rowMapper.toTypingDeckPassageRow(rows.getFirst());
	}

	@Transactional
	public boolean deletePassage(Long internalId) {
		int updated = entityManager.createNativeQuery("delete from public.typing_deck_passages where id = :internalId")
			.setParameter("internalId", internalId)
			.executeUpdate();
		return updated > 0;
	}

	@Transactional
	public void touchDeck(Long deckId, OffsetDateTime now) {
		entityManager.createNativeQuery("update public.typing_decks set updated_at = :updatedAt where id = :deckId")
			.setParameter("deckId", deckId)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	private void appendLanguageClause(StringBuilder sql, List<SqlParam> params, String languageTag) {
		if (languageTag == null || languageTag.isBlank()) return;
		if ("ko".equals(languageTag) || "en".equals(languageTag)) {
			sql.append(" and (d.language_tag = :languageTag or d.language_tag = 'mixed')");
		} else {
			sql.append(" and d.language_tag = :languageTag");
		}
		params.add(new SqlParam("languageTag", languageTag));
	}

	private void appendScopeClause(StringBuilder sql, List<SqlParam> params, UUID currentUserId, String scope, boolean adminMode) {
		if (adminMode && "all".equals(scope)) return;
		if ("mine".equals(scope)) {
			sql.append(" and d.owner_user_id = :ownerUserId");
			params.add(new SqlParam("ownerUserId", currentUserId));
			return;
		}
		if ("public".equals(scope)) {
			sql.append(" and d.visibility = 'public'");
			return;
		}
		if ("all".equals(scope)) {
			if (currentUserId != null) {
				sql.append(" and (d.visibility = 'public' or d.owner_user_id = :ownerUserId)");
				params.add(new SqlParam("ownerUserId", currentUserId));
			} else {
				sql.append(" and d.visibility = 'public'");
			}
			return;
		}
		sql.append(" and false");
	}

	private void bind(jakarta.persistence.Query query, List<SqlParam> params) {
		for (SqlParam param : params) {
			query.setParameter(param.name(), param.value());
		}
	}

	private record SqlParam(String name, Object value) {}
}
