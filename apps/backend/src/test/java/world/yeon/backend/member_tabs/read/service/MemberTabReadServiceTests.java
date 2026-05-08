package world.yeon.backend.member_tabs.read.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import world.yeon.backend.member_tabs.read.dto.MemberTabListResponse;
import world.yeon.backend.member_tabs.read.mapper.MemberTabReadMapper;
import world.yeon.backend.member_tabs.read.model.MemberTabDefinitionEntity;
import world.yeon.backend.member_tabs.read.repository.MemberTabReadRepository;

@ExtendWith(MockitoExtension.class)
class MemberTabReadServiceTests {

	@Mock
	private MemberTabReadRepository repository;

	private MemberTabReadService service;

	@BeforeEach
	void setUp() {
		service = new MemberTabReadService(repository, new MemberTabReadMapper());
	}

	@Test
	void space가있으면탭목록응답shape로반환한다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findTabsBySpaceInternalId(11L)).thenReturn(
			List.of(
				entity("mtb_overview", "system", "overview", "개요", true, 0),
				entity("mtb_custom", "custom", null, "상담 메모", false, 1)
			)
		);

		MemberTabListResponse result = service.listTabs("space_alpha");

		assertThat(result.tabs()).hasSize(2);
		assertThat(result.tabs().getFirst().id()).isEqualTo("mtb_overview");
		assertThat(result.tabs().getFirst().tabType()).isEqualTo("system");
		assertThat(result.tabs().get(1).systemKey()).isNull();
		assertThat(result.tabs().get(1).isVisible()).isFalse();
		assertThat(result.tabs().get(1).displayOrder()).isEqualTo(1);
	}

	@Test
	void space가없으면notFound예외를던진다() {
		when(repository.findSpaceInternalId("missing_space")).thenReturn(null);

		assertThatThrownBy(() -> service.listTabs("missing_space"))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("스페이스를 찾지 못했습니다.");
	}

	@Test
	void systemTab이없어도빈목록또는부분결과를그대로반환한다() {
		when(repository.findSpaceInternalId("space_empty")).thenReturn(22L);
		when(repository.findTabsBySpaceInternalId(22L)).thenReturn(List.of());

		MemberTabListResponse result = service.listTabs("space_empty");

		assertThat(result.tabs()).isEmpty();
	}

	private MemberTabDefinitionEntity entity(
		String publicId,
		String tabType,
		String systemKey,
		String name,
		boolean isVisible,
		int displayOrder
	) {
		MemberTabDefinitionEntity entity = new MemberTabDefinitionEntity();
		ReflectionTestUtils.setField(entity, "id", 1L);
		ReflectionTestUtils.setField(entity, "publicId", publicId);
		ReflectionTestUtils.setField(entity, "spaceId", 11L);
		ReflectionTestUtils.setField(entity, "createdByUserId", UUID.fromString("00000000-0000-0000-0000-000000000101"));
		ReflectionTestUtils.setField(entity, "tabType", tabType);
		ReflectionTestUtils.setField(entity, "systemKey", systemKey);
		ReflectionTestUtils.setField(entity, "name", name);
		ReflectionTestUtils.setField(entity, "isVisible", isVisible);
		ReflectionTestUtils.setField(entity, "displayOrder", displayOrder);
		ReflectionTestUtils.setField(entity, "createdAt", OffsetDateTime.parse("2026-05-07T00:00:00Z"));
		ReflectionTestUtils.setField(entity, "updatedAt", OffsetDateTime.parse("2026-05-07T00:00:00Z"));
		return entity;
	}
}
