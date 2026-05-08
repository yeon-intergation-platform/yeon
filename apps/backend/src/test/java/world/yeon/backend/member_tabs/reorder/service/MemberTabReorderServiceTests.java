package world.yeon.backend.member_tabs.reorder.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import world.yeon.backend.member_tabs.reorder.repository.MemberTabReorderRepository;

@ExtendWith(MockitoExtension.class)
class MemberTabReorderServiceTests {

	@Mock
	private MemberTabReorderRepository repository;

	private MemberTabReorderService service;

	@BeforeEach
	void setUp() {
		service = new MemberTabReorderService(repository);
	}

	@Test
	void order배열순서대로displayOrder를반영한다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);

		var response = service.reorderTabs(
			"space_alpha",
			List.of("mtb_hidden", "mtb_overview", "mtb_notes")
		);

		assertThat(response.ok()).isTrue();
		verify(repository).updateDisplayOrder("mtb_hidden", 1L, 0);
		verify(repository).updateDisplayOrder("mtb_overview", 1L, 1);
		verify(repository).updateDisplayOrder("mtb_notes", 1L, 2);
	}

	@Test
	void 없는스페이스면notFound다() {
		when(repository.findSpaceInternalId("missing")).thenReturn(null);

		assertThatThrownBy(() -> service.reorderTabs("missing", List.of("mtb_a")))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("스페이스를 찾지 못했습니다.");
	}
}
