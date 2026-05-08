package world.yeon.backend.member_fields.read.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_fields.read.dto.MemberFieldListResponse;
import world.yeon.backend.member_fields.read.mapper.MemberFieldReadMapper;
import world.yeon.backend.member_fields.read.model.MemberFieldDefinitionEntity;
import world.yeon.backend.member_fields.read.repository.MemberFieldReadRepository;

@ExtendWith(MockitoExtension.class)
class MemberFieldReadServiceTests {

	@Mock
	private MemberFieldReadRepository repository;

	private MemberFieldReadService service;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	@BeforeEach
	void setUp() {
		service = new MemberFieldReadService(repository, new MemberFieldReadMapper());
	}

	@Test
	void field목록을응답shape로반환한다() throws Exception {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findTabLookup("mtb_custom")).thenReturn(new MemberFieldReadRepository.TabLookup(21L, 11L));
		when(repository.findFields(11L, 21L)).thenReturn(List.of(
			entity("mfd_status", "상태", null, "select", "[{\"value\":\"in_progress\",\"color\":\"#818cf8\"}]", false, 0),
			entity("mfd_memo", "메모", null, "text", null, true, 1)
		));

		MemberFieldListResponse result = service.listFields("space_alpha", "mtb_custom");

		assertThat(result.fields()).hasSize(2);
		assertThat(result.fields().getFirst().id()).isEqualTo("mfd_status");
		assertThat(result.fields().getFirst().options()).hasSize(1);
		assertThat(result.fields().getFirst().options().getFirst().get("value")).isEqualTo("in_progress");
		assertThat(result.fields().get(1).isRequired()).isTrue();
	}

	@Test
	void space가없으면notFound다() {
		when(repository.findSpaceInternalId("missing_space")).thenReturn(null);

		assertThatThrownBy(() -> service.listFields("missing_space", "mtb_custom"))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("스페이스를 찾지 못했습니다.");
	}

	@Test
	void tab이없으면notFound다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findTabLookup("missing_tab")).thenReturn(null);

		assertThatThrownBy(() -> service.listFields("space_alpha", "missing_tab"))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("탭을 찾지 못했습니다.");
	}

	@Test
	void tab이해당space에없으면mismatch다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findTabLookup("mtb_other")).thenReturn(new MemberFieldReadRepository.TabLookup(99L, 12L));

		assertThatThrownBy(() -> service.listFields("space_alpha", "mtb_other"))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("탭이 스페이스에 속하지 않습니다.");
	}

	private MemberFieldDefinitionEntity entity(
		String publicId,
		String name,
		String sourceKey,
		String fieldType,
		String optionsJson,
		boolean isRequired,
		int displayOrder
	) throws Exception {
		MemberFieldDefinitionEntity entity = new MemberFieldDefinitionEntity();
		ReflectionTestUtils.setField(entity, "id", 1L);
		ReflectionTestUtils.setField(entity, "publicId", publicId);
		ReflectionTestUtils.setField(entity, "spaceId", 11L);
		ReflectionTestUtils.setField(entity, "createdByUserId", java.util.UUID.fromString("00000000-0000-0000-0000-000000000601"));
		ReflectionTestUtils.setField(entity, "tabId", 21L);
		ReflectionTestUtils.setField(entity, "name", name);
		ReflectionTestUtils.setField(entity, "sourceKey", sourceKey);
		ReflectionTestUtils.setField(entity, "fieldType", fieldType);
		ReflectionTestUtils.setField(entity, "options", optionsJson == null ? null : objectMapper.readTree(optionsJson));
		ReflectionTestUtils.setField(entity, "isRequired", isRequired);
		ReflectionTestUtils.setField(entity, "displayOrder", displayOrder);
		ReflectionTestUtils.setField(entity, "deletedAt", null);
		ReflectionTestUtils.setField(entity, "createdAt", OffsetDateTime.parse("2026-05-08T00:00:00Z"));
		ReflectionTestUtils.setField(entity, "updatedAt", OffsetDateTime.parse("2026-05-08T00:00:00Z"));
		return entity;
	}
}
