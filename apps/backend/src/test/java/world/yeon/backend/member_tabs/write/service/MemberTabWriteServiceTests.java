package world.yeon.backend.member_tabs.write.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import world.yeon.backend.member_tabs.read.model.MemberTabDefinitionEntity;
import world.yeon.backend.member_tabs.write.dto.CreateMemberTabRequest;
import world.yeon.backend.member_tabs.write.dto.UpdateMemberTabRequest;
import world.yeon.backend.member_tabs.write.repository.MemberTabWriteRepository;

@ExtendWith(MockitoExtension.class)
class MemberTabWriteServiceTests {

	@Mock
	private MemberTabWriteRepository repository;

	private MemberTabWriteService service;

	@BeforeEach
	void setUp() {
		service = new MemberTabWriteService(repository);
	}

	@Test
	void 커스텀탭을생성한다() {
		UUID userId = UUID.randomUUID();
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);
		when(repository.findMaxDisplayOrder(1L)).thenReturn(4);
		when(repository.save(any(MemberTabDefinitionEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		var response = service.createCustomTab(
			"space_alpha",
			userId,
			new CreateMemberTabRequest("  상담 메모  ")
		);

		assertThat(response.tab().id()).startsWith("mtb_");
		assertThat(response.tab().name()).isEqualTo("상담 메모");
		assertThat(response.tab().tabType()).isEqualTo("custom");
		assertThat(response.tab().displayOrder()).isEqualTo(5);
		verify(repository).findMaxDisplayOrder(1L);
		verify(repository).save(any(MemberTabDefinitionEntity.class));
	}

	@Test
	void 없는스페이스에는탭을생성할수없다() {
		when(repository.findSpaceInternalId("missing")).thenReturn(null);

		assertThatThrownBy(() -> service.createCustomTab(
			"missing",
			UUID.randomUUID(),
			new CreateMemberTabRequest("새 탭")
		)).isInstanceOf(NoSuchElementException.class)
			.hasMessage("스페이스를 찾지 못했습니다.");
	}

	@Test
	void 커스텀탭을수정한다() {
		MemberTabDefinitionEntity entity = createEntity(
			10L,
			"mtb_custom",
			1L,
			"custom",
			null,
			"기존 이름",
			true,
			1
		);
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);
		when(repository.findByPublicIdAndSpaceId("mtb_custom", 1L)).thenReturn(Optional.of(entity));
		when(repository.save(any(MemberTabDefinitionEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		var response = service.updateTab(
			"mtb_custom",
			"space_alpha",
			new UpdateMemberTabRequest("  새 이름  ", false, 7)
		);

		assertThat(response.tab().name()).isEqualTo("새 이름");
		assertThat(response.tab().isVisible()).isFalse();
		assertThat(response.tab().displayOrder()).isEqualTo(7);
		verify(repository).save(entity);
	}

	@Test
	void 보호된시스템탭은수정할수없다() {
		MemberTabDefinitionEntity entity = createEntity(
			11L,
			"mtb_overview",
			1L,
			"system",
			"overview",
			"개요",
			true,
			0
		);
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);
		when(repository.findByPublicIdAndSpaceId("mtb_overview", 1L)).thenReturn(Optional.of(entity));

		assertThatThrownBy(() -> service.updateTab(
			"mtb_overview",
			"space_alpha",
			new UpdateMemberTabRequest("변경", null, null)
		)).isInstanceOf(IllegalStateException.class)
			.hasMessage("기본 탭은 수정할 수 없습니다.");

		verify(repository, never()).save(any());
	}

	@Test
	void 커스텀탭을삭제한다() {
		MemberTabDefinitionEntity entity = createEntity(
			12L,
			"mtb_delete",
			1L,
			"custom",
			null,
			"삭제 대상",
			true,
			2
		);
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);
		when(repository.findByPublicIdAndSpaceId("mtb_delete", 1L)).thenReturn(Optional.of(entity));

		service.deleteCustomTab("mtb_delete", "space_alpha");

		verify(repository).delete(entity);
	}

	@Test
	void 시스템탭은삭제할수없다() {
		MemberTabDefinitionEntity entity = createEntity(
			13L,
			"mtb_system",
			1L,
			"system",
			null,
			"임시 시스템",
			true,
			2
		);
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);
		when(repository.findByPublicIdAndSpaceId("mtb_system", 1L)).thenReturn(Optional.of(entity));

		assertThatThrownBy(() -> service.deleteCustomTab("mtb_system", "space_alpha"))
			.isInstanceOf(IllegalStateException.class)
			.hasMessage("시스템 탭은 삭제할 수 없습니다.");

		verify(repository, never()).delete(any());
	}

	@Test
	void 빈이름으로는탭을생성할수없다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);

		assertThatThrownBy(() -> service.createCustomTab(
			"space_alpha",
			UUID.randomUUID(),
			new CreateMemberTabRequest("   ")
		)).isInstanceOf(IllegalArgumentException.class)
			.hasMessage("탭 이름은 필수입니다.");

		verify(repository, never()).save(any());
	}

	private MemberTabDefinitionEntity createEntity(
		Long id,
		String publicId,
		Long spaceId,
		String tabType,
		String systemKey,
		String name,
		boolean isVisible,
		int displayOrder
	) {
		MemberTabDefinitionEntity entity = new MemberTabDefinitionEntity();
		entity.setPublicId(publicId);
		entity.setSpaceId(spaceId);
		entity.setCreatedByUserId(UUID.randomUUID());
		entity.setTabType(tabType);
		entity.setSystemKey(systemKey);
		entity.setName(name);
		entity.setVisible(isVisible);
		entity.setDisplayOrder(displayOrder);
		entity.setCreatedAt(OffsetDateTime.now());
		entity.setUpdatedAt(OffsetDateTime.now());
		try {
			var field = MemberTabDefinitionEntity.class.getDeclaredField("id");
			field.setAccessible(true);
			field.set(entity, id);
		} catch (ReflectiveOperationException error) {
			throw new RuntimeException(error);
		}
		return entity;
	}
}
