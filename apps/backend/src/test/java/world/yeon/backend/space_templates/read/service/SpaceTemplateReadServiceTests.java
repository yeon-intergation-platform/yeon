package world.yeon.backend.space_templates.read.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.lang.reflect.Constructor;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.space_templates.read.dto.SpaceTemplateDetailResponse;
import world.yeon.backend.space_templates.read.dto.SpaceTemplateSummaryResponse;
import world.yeon.backend.space_templates.read.mapper.SpaceTemplateReadMapper;
import world.yeon.backend.space_templates.read.model.SpaceTemplateEntity;
import world.yeon.backend.space_templates.read.repository.SpaceTemplateReadRepository;

@ExtendWith(MockitoExtension.class)
class SpaceTemplateReadServiceTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000001");

	@Mock
	private SpaceTemplateReadRepository repository;

	private SpaceTemplateReadService service;

	@BeforeEach
	void setUp() {
		service = new SpaceTemplateReadService(
			repository,
			new SpaceTemplateReadMapper()
		);
	}

	@Test
	void 목록조회는사용자템플릿만summary로반환한다() {
		when(repository.findByIsSystemFalseAndCreatedByUserIdOrderByCreatedAtAsc(OWNER_ID))
			.thenReturn(
				List.of(
					entity("tmpl-user-owned", OWNER_ID, false, "나의 템플릿"),
					entity("tmpl-second", OWNER_ID, false, "두 번째 템플릿")
				)
			);

		List<SpaceTemplateSummaryResponse> result = service.listTemplates(OWNER_ID);

		assertThat(result).extracting(SpaceTemplateSummaryResponse::id)
			.containsExactly("tmpl-user-owned", "tmpl-second");
		assertThat(result).allMatch(summary -> !summary.isSystem());
	}

	@Test
	void 상세조회는accessibleTemplate을detail로변환한다() {
		when(repository.findAccessibleTemplate("tmpl-system", OWNER_ID))
			.thenReturn(Optional.of(entity("tmpl-system", null, true, "시스템 템플릿")));

		SpaceTemplateDetailResponse result =
			service.getTemplateDetail("tmpl-system", OWNER_ID);

		assertThat(result.id()).isEqualTo("tmpl-system");
		assertThat(result.isSystem()).isTrue();
		assertThat(result.tabsConfig()).hasSize(1);
	}

	@Test
	void 상세조회대상이없으면notFound예외를던진다() {
		when(repository.findAccessibleTemplate("missing", OWNER_ID))
			.thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.getTemplateDetail("missing", OWNER_ID))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("템플릿을 찾지 못했습니다.");
	}

	private SpaceTemplateEntity entity(
		String publicId,
		UUID createdByUserId,
		boolean isSystem,
		String name
	) {
		SpaceTemplateEntity entity = instantiateEntity();
		ReflectionTestUtils.setField(entity, "id", 1L);
		ReflectionTestUtils.setField(entity, "publicId", publicId);
		ReflectionTestUtils.setField(entity, "createdByUserId", createdByUserId);
		ReflectionTestUtils.setField(entity, "name", name);
		ReflectionTestUtils.setField(entity, "description", null);
		ReflectionTestUtils.setField(entity, "isSystem", isSystem);
		ReflectionTestUtils.setField(
			entity,
			"tabsConfig",
			new ObjectMapper().valueToTree(
				List.of(
					java.util.Map.of(
						"name",
						"개요",
						"tabType",
						"system",
						"systemKey",
						"overview",
						"displayOrder",
						0,
						"fields",
						List.of()
					)
				)
			)
		);
		ReflectionTestUtils.setField(
			entity,
			"createdAt",
			OffsetDateTime.parse("2026-05-07T00:00:00Z")
		);
		ReflectionTestUtils.setField(
			entity,
			"updatedAt",
			OffsetDateTime.parse("2026-05-07T00:00:00Z")
		);
		return entity;
	}

	private SpaceTemplateEntity instantiateEntity() {
		try {
			Constructor<SpaceTemplateEntity> constructor =
				SpaceTemplateEntity.class.getDeclaredConstructor();
			constructor.setAccessible(true);
			return constructor.newInstance();
		} catch (Exception error) {
			throw new IllegalStateException("테스트용 entity 생성에 실패했습니다.", error);
		}
	}
}
