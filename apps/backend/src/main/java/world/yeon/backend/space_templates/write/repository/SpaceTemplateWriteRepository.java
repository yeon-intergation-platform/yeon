package world.yeon.backend.space_templates.write.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import world.yeon.backend.space_templates.read.model.SpaceTemplateEntity;

public interface SpaceTemplateWriteRepository extends JpaRepository<SpaceTemplateEntity, Long> {

	Optional<SpaceTemplateEntity> findByPublicId(String publicId);

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
