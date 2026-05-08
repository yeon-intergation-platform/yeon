package world.yeon.backend.counseling_record_students.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class CounselingRecordStudentRepository {
	public record StudentSummaryRow(String studentName, long recordCount, OffsetDateTime firstCounselingAt, OffsetDateTime lastCounselingAt) {}

	@PersistenceContext
	private EntityManager entityManager;

	public List<StudentSummaryRow> listStudentSummaries(UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select student_name,
			       count(*) as record_count,
			       min(created_at) as first_counseling_at,
			       max(created_at) as last_counseling_at
			from public.counseling_records
			where created_by_user_id = :userId
			  and student_name is not null
			  and trim(student_name) <> ''
			group by student_name
			order by max(created_at) desc, student_name asc
		""")
			.setParameter("userId", userId)
			.getResultList();
		return rows.stream().map(row -> {
			Object[] values = (Object[]) row;
			return new StudentSummaryRow(
				(String) values[0],
				((Number) values[1]).longValue(),
				asOffsetDateTime(values[2]),
				asOffsetDateTime(values[3])
			);
		}).toList();
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
