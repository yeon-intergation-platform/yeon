package world.yeon.backend.space_templates.read.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import world.yeon.backend.space_templates.read.model.SpaceTemplateEntity;

public interface SpaceTemplateReadRepository
		extends JpaRepository<SpaceTemplateEntity, Long> {

	List<SpaceTemplateEntity> findByIsSystemFalseAndCreatedByUserIdOrderByCreatedAtAsc(
		UUID userId
	);

	@Query("""
		select template
		from SpaceTemplateEntity template
		where template.publicId = :templatePublicId
		  and (template.isSystem = true or template.createdByUserId = :userId)
		""")
	Optional<SpaceTemplateEntity> findAccessibleTemplate(
		@Param("templatePublicId") String templatePublicId,
		@Param("userId") UUID userId
	);
}
