package world.yeon.backend.sheet_export.import_mutation.repository;

import java.math.BigInteger;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;

@Repository
@Profile("jdbc")
public class SheetExportImportMutationRepository {

	private final EntityManager entityManager;

	public SheetExportImportMutationRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public Long findLinkedExportSpaceInternalId(String spacePublicId, String sheetId) {
		List<?> rows = entityManager.createNativeQuery("""
			select i.space_id
			from public.sheet_integrations i
			inner join public.spaces s on s.id = i.space_id
			where s.public_id = :spacePublicId
			  and i.sheet_id = :sheetId
			  and i.data_type = 'export'
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("sheetId", sheetId)
			.getResultList();
		if (rows.isEmpty()) {
			return null;
		}
		return asLong(rows.getFirst());
	}

	@Transactional
	public String createMember(
		Long spaceInternalId,
		String memberPublicId,
		String name,
		String email,
		String phone,
		String status,
		String initialRiskLevel
	) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.members (
			  public_id,
			  space_id,
			  name,
			  email,
			  phone,
			  status,
			  initial_risk_level,
			  created_at,
			  updated_at
			) values (
			  :memberPublicId,
			  :spaceInternalId,
			  :name,
			  :email,
			  :phone,
			  :status,
			  :initialRiskLevel,
			  now(),
			  now()
			)
			returning public_id
			""")
			.setParameter("memberPublicId", memberPublicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("name", name)
			.setParameter("email", email)
			.setParameter("phone", phone)
			.setParameter("status", status)
			.setParameter("initialRiskLevel", initialRiskLevel)
			.getResultList();
		if (rows.isEmpty()) {
			return null;
		}
		return (String) rows.getFirst();
	}

	@Transactional
	public boolean updateMember(
		Long spaceInternalId,
		String memberPublicId,
		String name,
		String email,
		String phone,
		boolean shouldUpdateStatus,
		String status,
		String initialRiskLevel
	) {
		int updated = entityManager.createNativeQuery("""
			update public.members
			set name = :name,
			    email = :email,
			    phone = :phone,
			    status = case when :shouldUpdateStatus then :status else status end,
			    initial_risk_level = :initialRiskLevel,
			    updated_at = now()
			where public_id = :memberPublicId
			  and space_id = :spaceInternalId
			""")
			.setParameter("name", name)
			.setParameter("email", email)
			.setParameter("phone", phone)
			.setParameter("shouldUpdateStatus", shouldUpdateStatus)
			.setParameter("status", status)
			.setParameter("initialRiskLevel", initialRiskLevel)
			.setParameter("memberPublicId", memberPublicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.executeUpdate();
		return updated > 0;
	}

	private Long asLong(Object value) {
		if (value instanceof BigInteger bigInteger) return bigInteger.longValue();
		if (value instanceof Number number) return number.longValue();
		throw new IllegalStateException("ID를 숫자로 해석하지 못했습니다.");
	}
}
