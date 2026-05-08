package world.yeon.backend.member_risk_profiles.repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class MemberRiskProfileRepository {
	public record MemberRiskRecordRow(
		String memberId,
		String analysisResult,
		String recordSource,
		String audioStoragePath,
		OffsetDateTime createdAt
	) {}

	private final EntityManager entityManager;

	public MemberRiskProfileRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public List<MemberRiskRecordRow> findRiskRecordsByMemberIds(UUID userId, List<String> memberPublicIds) {
		if (memberPublicIds.isEmpty()) {
			return List.of();
		}

		return entityManager.createNativeQuery("""
			with target_members as (
			  select id, public_id
			  from public.members
			  where public_id in (:memberPublicIds)
			),
			ranked_risk_records as (
			  select
			    tm.public_id as member_public_id,
			    cr.analysis_result::text as analysis_result,
			    cr.record_source,
			    cr.audio_storage_path,
			    cr.created_at,
			    row_number() over (partition by cr.member_id order by cr.created_at desc) as row_number
			  from public.counseling_records cr
			  join target_members tm on tm.id = cr.member_id
			  where cr.created_by_user_id = :userId
			)
			select member_public_id, analysis_result, record_source, audio_storage_path, created_at
			from ranked_risk_records
			where row_number <= 5
			""")
			.setParameter("userId", userId)
			.setParameter("memberPublicIds", memberPublicIds)
			.getResultList()
			.stream()
			.map(this::toRow)
			.toList();
	}

	private MemberRiskRecordRow toRow(Object row) {
		Object[] values = (Object[]) row;
		return new MemberRiskRecordRow(
			(String) values[0],
			values[1] == null ? null : values[1].toString(),
			(String) values[2],
			(String) values[3],
			asOffsetDateTime(values[4])
		);
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof Instant instant) return instant.atOffset(ZoneOffset.UTC);
		if (value instanceof Date date) return date.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof LocalDateTime localDateTime) return localDateTime.atOffset(ZoneOffset.UTC);
		if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();
		return OffsetDateTime.parse(value.toString());
	}
}
