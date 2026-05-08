package world.yeon.backend.member_tabs.reset.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.when;

import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import world.yeon.backend.member_tabs.reset.repository.MemberTabResetRepository;

@ExtendWith(MockitoExtension.class)
class MemberTabResetServiceTests {

	@Mock
	private MemberTabResetRepository repository;

	private MemberTabResetService service;

	@BeforeEach
	void setUp() {
		service = new MemberTabResetService(repository);
	}

	@Test
	void custom삭제후시스템탭5개를순서대로복원한다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(1L);

		var response = service.resetTabs("space_alpha");

		assertThat(response.ok()).isTrue();
		InOrder inOrder = inOrder(repository);
		inOrder.verify(repository).findSpaceInternalId("space_alpha");
		inOrder.verify(repository).deleteCustomTabs(1L);
		inOrder.verify(repository).restoreSystemTab(1L, "overview", "개요", 0);
		inOrder.verify(repository).restoreSystemTab(1L, "student_board", "출석·과제", 1);
		inOrder.verify(repository).restoreSystemTab(1L, "counseling", "상담기록", 2);
		inOrder.verify(repository).restoreSystemTab(1L, "memos", "메모", 3);
		inOrder.verify(repository).restoreSystemTab(1L, "report", "리포트", 4);
	}

	@Test
	void 없는스페이스면notFound다() {
		when(repository.findSpaceInternalId("missing")).thenReturn(null);

		assertThatThrownBy(() -> service.resetTabs("missing"))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("스페이스를 찾지 못했습니다.");
	}
}
