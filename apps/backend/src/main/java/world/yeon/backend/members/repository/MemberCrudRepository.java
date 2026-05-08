package world.yeon.backend.members.repository;

import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;

@Repository
@Profile("jdbc")
public class MemberCrudRepository {

	public record MemberRow(
		Long memberInternalId,
		Long spaceInternalId,
		String memberId,
		String spaceId,
		String name,
		String email,
		String phone,
		String status,
		String initialRiskLevel,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	private final EntityManager entityManager;

	public MemberCrudRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public Long findOwnedSpaceInternalId(String spacePublicId, UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select s.id
			from public.spaces s
			where s.public_id = :spacePublicId
			  and s.created_by_user_id = :userId
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return asLong(rows.getFirst());
	}

	public List<MemberRow> findMembersInOwnedSpace(String spacePublicId, UUID userId) {
		return entityManager.createNativeQuery("""
			select m.id, s.id, m.public_id, s.public_id, m.name, m.email, m.phone, m.status, m.initial_risk_level, m.created_at, m.updated_at
			from public.members m
			inner join public.spaces s on s.id = m.space_id
			where s.public_id = :spacePublicId
			  and s.created_by_user_id = :userId
			order by m.created_at desc, m.id desc
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("userId", userId)
			.getResultList()
			.stream()
			.map(this::toRow)
			.toList();
	}

	public MemberRow findOwnedMember(String memberPublicId, UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select m.id, s.id, m.public_id, s.public_id, m.name, m.email, m.phone, m.status, m.initial_risk_level, m.created_at, m.updated_at
			from public.members m
			inner join public.spaces s on s.id = m.space_id
			where m.public_id = :memberPublicId
			  and s.created_by_user_id = :userId
			limit 1
			""")
			.setParameter("memberPublicId", memberPublicId)
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toRow(rows.getFirst());
	}

	public MemberRow findOwnedMemberInSpace(String spacePublicId, String memberPublicId, UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select m.id, s.id, m.public_id, s.public_id, m.name, m.email, m.phone, m.status, m.initial_risk_level, m.created_at, m.updated_at
			from public.members m
			inner join public.spaces s on s.id = m.space_id
			where s.public_id = :spacePublicId
			  and m.public_id = :memberPublicId
			  and s.created_by_user_id = :userId
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("memberPublicId", memberPublicId)
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toRow(rows.getFirst());
	}

	@Transactional
	public MemberRow insertMember(Long spaceInternalId, String publicId, String name, String email, String phone, String status, String initialRiskLevel, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.members (
			  public_id, space_id, name, email, phone, status, initial_risk_level, created_at, updated_at
			) values (
			  :publicId, :spaceInternalId, :name, :email, :phone, :status, :initialRiskLevel, :now, :now
			)
			returning id, space_id, public_id, (select public_id from public.spaces where id = :spaceInternalId), name, email, phone, status, initial_risk_level, created_at, updated_at
			""")
			.setParameter("publicId", publicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("name", name)
			.setParameter("email", email)
			.setParameter("phone", phone)
			.setParameter("status", status)
			.setParameter("initialRiskLevel", initialRiskLevel)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toRow(rows.getFirst());
	}

	@Transactional
	public MemberRow updateMember(Long memberInternalId, String name, String email, String phone, String status, String initialRiskLevel, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.members m
			set name = :name,
			    email = :email,
			    phone = :phone,
			    status = :status,
			    initial_risk_level = :initialRiskLevel,
			    updated_at = :now
			where m.id = :memberInternalId
			returning m.id, m.space_id, m.public_id, (select public_id from public.spaces where id = m.space_id), m.name, m.email, m.phone, m.status, m.initial_risk_level, m.created_at, m.updated_at
			""")
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("name", name)
			.setParameter("email", email)
			.setParameter("phone", phone)
			.setParameter("status", status)
			.setParameter("initialRiskLevel", initialRiskLevel)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toRow(rows.getFirst());
	}

	@Transactional
	public void deleteMember(Long memberInternalId) {
		entityManager.createNativeQuery("delete from public.members where id = :memberInternalId")
			.setParameter("memberInternalId", memberInternalId)
			.executeUpdate();
	}

	public List<MemberRow> findOwnedMembersInSpace(String spacePublicId, UUID userId, List<String> memberIds) {
		return entityManager.createNativeQuery("""
			select m.id, s.id, m.public_id, s.public_id, m.name, m.email, m.phone, m.status, m.initial_risk_level, m.created_at, m.updated_at
			from public.members m
			inner join public.spaces s on s.id = m.space_id
			where s.public_id = :spacePublicId
			  and s.created_by_user_id = :userId
			  and m.public_id in (:memberIds)
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("userId", userId)
			.setParameter("memberIds", memberIds)
			.getResultList()
			.stream()
			.map(this::toRow)
			.toList();
	}

	@Transactional
	public List<String> deleteMembersInSpace(String spacePublicId, UUID userId, List<String> memberIds) {
		return entityManager.createNativeQuery("""
			delete from public.members m
			using public.spaces s
			where m.space_id = s.id
			  and s.public_id = :spacePublicId
			  and s.created_by_user_id = :userId
			  and m.public_id in (:memberIds)
			returning m.public_id
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("userId", userId)
			.setParameter("memberIds", memberIds)
			.getResultList()
			.stream()
			.map(String.class::cast)
			.toList();
	}

	private MemberRow toRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 11) {
			throw new IllegalStateException("member row를 해석하지 못했습니다.");
		}
		return new MemberRow(
			asLong(values[0]),
			asLong(values[1]),
			(String) values[2],
			(String) values[3],
			(String) values[4],
			(String) values[5],
			(String) values[6],
			(String) values[7],
			(String) values[8],
			asOffsetDateTime(values[9]),
			asOffsetDateTime(values[10])
		);
	}

	private Long asLong(Object value) {
		if (value instanceof BigInteger bigInteger) return bigInteger.longValue();
		if (value instanceof Number number) return number.longValue();
		throw new IllegalStateException("ID를 숫자로 해석하지 못했습니다.");
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();
		if (value instanceof Instant instant) return instant.atZone(ZoneId.systemDefault()).toOffsetDateTime();
		if (value instanceof LocalDateTime localDateTime) return localDateTime.atZone(ZoneId.systemDefault()).toOffsetDateTime();
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atZone(ZoneId.systemDefault()).toOffsetDateTime();
		if (value instanceof Date date) return date.toInstant().atZone(ZoneId.systemDefault()).toOffsetDateTime();
		throw new IllegalStateException("일시 값을 해석하지 못했습니다. 타입=" + value.getClass().getName());
	}
}
