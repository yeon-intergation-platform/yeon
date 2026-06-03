package world.yeon.backend.member_fields.write.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_fields.read.model.MemberFieldDefinitionEntity;
import world.yeon.backend.member_fields.write.dto.CreateMemberFieldRequest;
import world.yeon.backend.member_fields.write.dto.UpdateMemberFieldRequest;
import world.yeon.backend.member_fields.write.repository.MemberFieldWriteRepository;
import world.yeon.backend.space_access.service.SpaceAccessService;

@ExtendWith(MockitoExtension.class)
class MemberFieldWriteServiceTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000783");

	@Mock
	private MemberFieldWriteRepository repository;

	@Mock
	private SpaceAccessService spaceAccessService;

	private MemberFieldWriteService service;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void setUp() {
		service = new MemberFieldWriteService(repository, spaceAccessService);
	}

	@Test
	void create는새필드를생성한다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findTabLookup("mtb_custom")).thenReturn(new MemberFieldWriteRepository.TabLookup(21L, 11L));
		when(repository.findMaxDisplayOrder(11L, 21L)).thenReturn(3);
		when(repository.save(org.mockito.ArgumentMatchers.any())).thenAnswer(invocation -> invocation.getArgument(0));

		var result = service.create("space_alpha", "mtb_custom", OWNER_ID, new CreateMemberFieldRequest("상태", "select", List.of(java.util.Map.of("value", "in_progress", "color", "#818cf8")), true));

		assertThat(result.getName()).isEqualTo("상태");
		assertThat(result.getDisplayOrder()).isEqualTo(4);
		assertThat(result.isRequired()).isTrue();
		assertThat(result.getOptions().toString()).contains("in_progress");
	}

	@Test
	void update는기본필드제약을지킨다() throws Exception {
		MemberFieldDefinitionEntity entity = new MemberFieldDefinitionEntity();
		entity.setPublicId("mfd_overview");
		entity.setSpaceId(11L);
		entity.setSourceKey("member_name");
		entity.setFieldType("text");
		entity.setRequired(false);
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findFieldByPublicIdInSpace("mfd_overview", 11L)).thenReturn(entity);

		assertThatThrownBy(() -> service.update("mfd_overview", "space_alpha", OWNER_ID, new UpdateMemberFieldRequest("이름", "number", null, null, null, null)))
			.isInstanceOf(MemberFieldWriteServiceException.class)
			.hasMessage("기본 항목은 이름과 순서만 변경할 수 있습니다.");
	}

	@Test
	void update는필드를수정한다() throws Exception {
		MemberFieldDefinitionEntity entity = new MemberFieldDefinitionEntity();
		entity.setPublicId("mfd_custom");
		entity.setSpaceId(11L);
		entity.setFieldType("text");
		entity.setRequired(false);
		entity.setName("기존");
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findFieldByPublicIdInSpace("mfd_custom", 11L)).thenReturn(entity);
		when(repository.save(entity)).thenReturn(entity);

		var result = service.update("mfd_custom", "space_alpha", OWNER_ID, new UpdateMemberFieldRequest("변경", null, null, true, 5, null));
		assertThat(result.getName()).isEqualTo("변경");
		assertThat(result.isRequired()).isTrue();
		assertThat(result.getDisplayOrder()).isEqualTo(5);
	}

	@Test
	void delete는softDelete한다() {
		MemberFieldDefinitionEntity entity = new MemberFieldDefinitionEntity();
		entity.setPublicId("mfd_custom");
		entity.setSpaceId(11L);
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findFieldByPublicIdInSpace("mfd_custom", 11L)).thenReturn(entity);
		when(repository.save(entity)).thenReturn(entity);

		service.delete("mfd_custom", "space_alpha", OWNER_ID);
		assertThat(entity.getDeletedAt()).isNotNull();
	}
}
