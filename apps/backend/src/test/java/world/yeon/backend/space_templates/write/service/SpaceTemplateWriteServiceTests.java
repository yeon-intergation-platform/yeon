package world.yeon.backend.space_templates.write.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Constructor;
import java.time.OffsetDateTime;
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

import world.yeon.backend.space_access.service.SpaceAccessService;
import world.yeon.backend.space_templates.read.mapper.SpaceTemplateReadMapper;
import world.yeon.backend.space_templates.read.model.SpaceTemplateEntity;
import world.yeon.backend.space_templates.write.dto.CreateSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.dto.SnapshotSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.dto.UpdateSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.repository.SpaceTemplateApplyRepository;
import world.yeon.backend.space_templates.write.repository.SpaceTemplateSnapshotQueryRepository;
import world.yeon.backend.space_templates.write.repository.SpaceTemplateWriteRepository;

@ExtendWith(MockitoExtension.class)
class SpaceTemplateWriteServiceTests {

	@Mock
	private SpaceTemplateWriteRepository repository;
	@Mock
	private SpaceTemplateSnapshotQueryRepository snapshotQueryRepository;
	@Mock
	private SpaceTemplateApplyRepository applyRepository;
	@Mock
	private SpaceAccessService spaceAccessService;

	private SpaceTemplateWriteService service;

	@BeforeEach
	void setUp() {
		service = new SpaceTemplateWriteService(
			repository,
			snapshotQueryRepository,
			applyRepository,
			new SpaceTemplateReadMapper(),
			spaceAccessService
		);
	}

	@Test
	void 사용자_템플릿을_생성한다() {
		UUID userId = UUID.randomUUID();
		when(repository.save(any(SpaceTemplateEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		var response = service.createTemplate(
			userId,
			new CreateSpaceTemplateRequest(
				"  새 템플릿  ",
				"  설명  ",
				List.of(
					new CreateSpaceTemplateRequest.TemplateTabRequest(
						"개요",
						"system",
						"overview",
						0,
						List.of()
					)
				)
			)
		);

		assertThat(response.id()).startsWith("tpl_");
		assertThat(response.name()).isEqualTo("새 템플릿");
		assertThat(response.description()).isEqualTo("설명");
		verify(repository).save(any(SpaceTemplateEntity.class));
	}

	@Test
	void 사용자_템플릿을_수정한다() throws Exception {
		UUID userId = UUID.randomUUID();
		SpaceTemplateEntity entity = createTemplateEntity(
			1L,
			"tmpl-user-owned",
			userId,
			"기존 이름",
			"기존 설명",
			false
		);
		when(repository.findByPublicId("tmpl-user-owned"))
			.thenReturn(Optional.of(entity));
		when(repository.save(any(SpaceTemplateEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		var response = service.updateTemplate(
			"tmpl-user-owned",
			userId,
			new UpdateSpaceTemplateRequest("  새 이름  ", "  새 설명  ")
		);

		assertThat(response.name()).isEqualTo("새 이름");
		assertThat(response.description()).isEqualTo("새 설명");
		assertThat(entity.getUpdatedAt()).isNotNull();
		verify(repository).save(entity);
	}

	@Test
	void 시스템_템플릿은_수정할_수_없다() throws Exception {
		UUID userId = UUID.randomUUID();
		when(repository.findByPublicId("tmpl-system"))
			.thenReturn(Optional.of(createTemplateEntity(2L, "tmpl-system", userId, "시스템", null, true)));

		assertThatThrownBy(() -> service.updateTemplate(
			"tmpl-system",
			userId,
			new UpdateSpaceTemplateRequest("변경", null)
		)).isInstanceOf(IllegalStateException.class)
			.hasMessage("시스템 템플릿은 수정할 수 없습니다.");

		verify(repository, never()).save(any());
	}

	@Test
	void 다른_사용자_템플릿은_삭제할_수_없다() throws Exception {
		UUID ownerId = UUID.randomUUID();
		when(repository.findByPublicId("tmpl-other"))
			.thenReturn(Optional.of(createTemplateEntity(3L, "tmpl-other", ownerId, "다른 사용자", null, false)));

		assertThatThrownBy(() -> service.deleteTemplate("tmpl-other", UUID.randomUUID()))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("템플릿을 찾지 못했습니다.");

		verify(repository, never()).delete(any());
	}

	@Test
	void 사용자_템플릿을_삭제한다() throws Exception {
		UUID userId = UUID.randomUUID();
		SpaceTemplateEntity entity = createTemplateEntity(
			4L,
			"tmpl-delete",
			userId,
			"삭제 대상",
			null,
			false
		);
		when(repository.findByPublicId("tmpl-delete")).thenReturn(Optional.of(entity));

		service.deleteTemplate("tmpl-delete", userId);

		verify(repository).delete(entity);
	}

	@Test
	void 시스템_또는_접근가능한_템플릿을_복제한다() throws Exception {
		UUID userId = UUID.randomUUID();
		SpaceTemplateEntity systemTemplate = createTemplateEntity(
			5L,
			"tmpl-system",
			null,
			"시스템 템플릿",
			"설명",
			true
		);
		when(repository.findAccessibleTemplate("tmpl-system", userId))
			.thenReturn(Optional.of(systemTemplate));
		when(repository.save(any(SpaceTemplateEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		var response = service.duplicateTemplate("tmpl-system", userId);

		assertThat(response.id()).startsWith("tpl_");
		assertThat(response.name()).isEqualTo("시스템 템플릿 복사본");
		assertThat(response.isSystem()).isFalse();
		verify(repository).save(any(SpaceTemplateEntity.class));
	}

	@Test
	void 접근불가_템플릿은_복제할_수_없다() {
		UUID userId = UUID.randomUUID();
		when(repository.findAccessibleTemplate("tmpl-missing", userId)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.duplicateTemplate("tmpl-missing", userId))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("템플릿을 찾지 못했습니다.");
	}

	@Test
	void 스페이스를_스냅샷해서_템플릿을_생성한다() {
		UUID userId = UUID.randomUUID();
		when(snapshotQueryRepository.loadTabs("spc_1")).thenReturn(List.of(
			new SpaceTemplateSnapshotQueryRepository.TabSnapshotRow(
				"개요",
				"system",
				"overview",
				0
			)
		));
		when(snapshotQueryRepository.loadFields("spc_1", "개요", 0)).thenReturn(List.of());
		when(repository.save(any(SpaceTemplateEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		var response = service.snapshotSpaceAsTemplate(
			"spc_1",
			userId,
			new SnapshotSpaceTemplateRequest("스냅샷", "설명")
		);

		assertThat(response.id()).startsWith("tpl_");
		assertThat(response.name()).isEqualTo("스냅샷");
		verify(repository).save(any(SpaceTemplateEntity.class));
	}

	@Test
	void 없는_스페이스는_스냅샷할_수_없다() {
		UUID userId = UUID.randomUUID();
		org.mockito.Mockito.doThrow(new NoSuchElementException("스페이스를 찾지 못했습니다."))
			.when(spaceAccessService).requireOwnedSpace("missing", userId);

		assertThatThrownBy(() -> service.snapshotSpaceAsTemplate(
			"missing",
			userId,
			new SnapshotSpaceTemplateRequest("스냅샷", null)
		)).isInstanceOf(NoSuchElementException.class)
			.hasMessage("스페이스를 찾지 못했습니다.");
	}

	@Test
	void 템플릿을_스페이스에_적용한다() throws Exception {
		UUID userId = UUID.randomUUID();
		SpaceTemplateEntity template = createTemplateEntity(
			6L,
			"tmpl-apply",
			userId,
			"적용 템플릿",
			"설명",
			false
		);
		when(applyRepository.requireSpaceInternalId("spc_1")).thenReturn(10L);
		when(repository.findAccessibleTemplate("tmpl-apply", userId)).thenReturn(Optional.of(template));
		when(applyRepository.findSystemTabId(10L, "overview")).thenReturn(100L);
		when(applyRepository.insertCustomTab(any(), eq(10L), eq(userId), eq("커스텀"), eq(1), any()))
			.thenReturn(101L);
		ReflectionTestUtils.setField(
			template,
			"tabsConfig",
			new ObjectMapper().valueToTree(
				List.of(
					new Object() {
						public final String name = "개요";
						public final String tabType = "system";
						public final String systemKey = "overview";
						public final int displayOrder = 0;
						public final List<Object> fields = List.of();
					},
					new Object() {
						public final String name = "커스텀";
						public final String tabType = "custom";
						public final String systemKey = null;
						public final int displayOrder = 1;
						public final List<Object> fields = List.of(
							new Object() {
								public final String name = "메모";
								public final String fieldType = "text";
								public final Object options = null;
								public final boolean isRequired = false;
								public final int displayOrder = 0;
							}
						);
					}
				)
			)
		);

		service.applyTemplateToSpace("tmpl-apply", "spc_1", userId);

		verify(applyRepository).deleteAllFieldDefinitions(10L);
		verify(applyRepository).deleteCustomTabs(10L);
		verify(applyRepository).updateSystemTab(eq(100L), eq("개요"), eq(0), any());
		verify(applyRepository).insertField(any(), eq(10L), eq(userId), eq(101L), eq("메모"), eq("text"), eq(null), eq(false), eq(0), any());
	}

	private SpaceTemplateEntity createTemplateEntity(
		Long id,
		String publicId,
		UUID createdByUserId,
		String name,
		String description,
		boolean isSystem
	) throws Exception {
		Constructor<SpaceTemplateEntity> constructor = SpaceTemplateEntity.class.getDeclaredConstructor();
		constructor.setAccessible(true);
		SpaceTemplateEntity entity = constructor.newInstance();
		ReflectionTestUtils.setField(entity, "id", id);
		ReflectionTestUtils.setField(entity, "publicId", publicId);
		ReflectionTestUtils.setField(entity, "createdByUserId", createdByUserId);
		ReflectionTestUtils.setField(entity, "name", name);
		ReflectionTestUtils.setField(entity, "description", description);
		ReflectionTestUtils.setField(entity, "isSystem", isSystem);
		ReflectionTestUtils.setField(
			entity,
			"tabsConfig",
			new ObjectMapper().valueToTree(
				List.of(
					new Object() {
						public final String name = "개요";
						public final String tabType = "system";
						public final String systemKey = "overview";
						public final int displayOrder = 0;
						public final List<Object> fields = List.of();
					}
				)
			)
		);
		ReflectionTestUtils.setField(entity, "createdAt", OffsetDateTime.parse("2026-05-07T00:00:00Z"));
		ReflectionTestUtils.setField(entity, "updatedAt", OffsetDateTime.parse("2026-05-07T00:00:00Z"));
		return entity;
	}
}
