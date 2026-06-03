package world.yeon.backend.member_fields.reorder.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import world.yeon.backend.member_fields.reorder.repository.MemberFieldReorderRepository;
import world.yeon.backend.space_access.service.SpaceAccessService;

@ExtendWith(MockitoExtension.class)
class MemberFieldReorderServiceTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
	@Mock private MemberFieldReorderRepository repository;
	@Mock private SpaceAccessService spaceAccessService;
	private MemberFieldReorderService service;
	@BeforeEach
	void setUp() { service = new MemberFieldReorderService(repository, spaceAccessService); }

	@Test
	void order배열순서대로displayOrder를단일배치UPDATE로반영한다() {
		List<String> order = List.of("mfd_c", "mfd_a", "mfd_b");
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);
		when(repository.batchUpdateDisplayOrder(order, 1L)).thenReturn(3);

		var response = service.reorderFields(USER_ID, "space_alpha", order);

		assertThat(response.ok()).isTrue();
		verify(repository).batchUpdateDisplayOrder(order, 1L);
	}

	@Test
	void 다른스페이스필드가포함되면예외를던진다() {
		List<String> order = List.of("mfd_a", "mfd_other_space");
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);
		// space_id 불일치로 1개만 영향받음
		when(repository.batchUpdateDisplayOrder(order, 1L)).thenReturn(1);

		assertThatThrownBy(() -> service.reorderFields(USER_ID, "space_alpha", order))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("이 스페이스에 속하지 않는 필드");
	}

	@Test
	void 없는스페이스면notFound다() {
		when(repository.findSpaceInternalId("missing")).thenReturn(null);
		assertThatThrownBy(() -> service.reorderFields(USER_ID, "missing", List.of("mfd_a")))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("스페이스를 찾지 못했습니다.");
	}

	@Test
	void 빈order는성공으로처리한다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);
		var response = service.reorderFields(USER_ID, "space_alpha", List.of());
		assertThat(response.ok()).isTrue();
	}
}
