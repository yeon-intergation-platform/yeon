package world.yeon.backend.member_fields.bootstrap_overview.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
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

import world.yeon.backend.member_fields.bootstrap_overview.repository.MemberFieldOverviewBootstrapRepository;
import world.yeon.backend.member_fields.bootstrap_overview.support.DefaultOverviewFields;

@ExtendWith(MockitoExtension.class)
class MemberFieldOverviewBootstrapServiceTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000781");

	@Mock
	private MemberFieldOverviewBootstrapRepository repository;

	private MemberFieldOverviewBootstrapService service;

	@BeforeEach
	void setUp() {
		service = new MemberFieldOverviewBootstrapService(repository);
	}

	@Test
	void overview탭이면누락된기본필드만삽입한다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findTabLookup("mtb_overview")).thenReturn(new MemberFieldOverviewBootstrapRepository.TabLookup(21L, 11L, "overview"));
		when(repository.findExistingSourceKeys(11L, 21L)).thenReturn(List.of("member_name"));

		var result = service.bootstrap("space_alpha", "mtb_overview", OWNER_ID);

		assertThat(result.ok()).isTrue();
		verify(repository).lockTabRow(21L);
		verify(repository, never()).insertOverviewField(11L, 21L, OWNER_ID, DefaultOverviewFields.DEFAULTS.getFirst());
		verify(repository).insertOverviewField(11L, 21L, OWNER_ID, DefaultOverviewFields.DEFAULTS.get(1));
	}

	@Test
	void overview가아니면거절한다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findTabLookup("mtb_custom")).thenReturn(new MemberFieldOverviewBootstrapRepository.TabLookup(21L, 11L, null));

		assertThatThrownBy(() -> service.bootstrap("space_alpha", "mtb_custom", OWNER_ID))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("개요 탭에서만 기본 필드 초기화를 수행할 수 있습니다.");
	}

	@Test
	void 스페이스가없으면404대상예외다() {
		when(repository.findSpaceInternalId("missing")).thenReturn(null);

		assertThatThrownBy(() -> service.bootstrap("missing", "mtb_overview", OWNER_ID))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("스페이스를 찾지 못했습니다.");
	}
}
