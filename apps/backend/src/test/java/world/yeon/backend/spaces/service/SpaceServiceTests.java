package world.yeon.backend.spaces.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.spaces.dto.CreateSpaceRequest;
import world.yeon.backend.spaces.dto.UpdateSpaceRequest;
import world.yeon.backend.spaces.repository.SpaceRepository;

@ExtendWith(MockitoExtension.class)
class SpaceServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000941");

	@Mock private SpaceRepository repository;
	private SpaceService service;

	@BeforeEach void setUp() {
		service = new SpaceService(repository);
	}

	@Test void 목록응답을반환한다() {
		when(repository.listOwnedSpaces(OWNER_ID)).thenReturn(List.of(
			new SpaceRepository.SpaceRow(1L, "spc_alpha", "알파", null, null, null, OWNER_ID.toString(), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
		));

		var result = service.listSpaces(OWNER_ID);
		assertThat(result.spaces()).hasSize(1);
		assertThat(result.spaces().getFirst().id()).isEqualTo("spc_alpha");
	}

	@Test void 생성시기본탭과필드를포함한space를반환한다() {
		when(repository.insertSpaceWithDefaults(any(), eq("알파"), eq(null), eq("2026-05-01"), eq("2026-05-31"), eq(OWNER_ID), any(), any(), any()))
			.thenReturn(new SpaceRepository.SpaceRow(1L, "spc_alpha", "알파", null, "2026-05-01", "2026-05-31", OWNER_ID.toString(), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z")));

		var result = service.createSpace(OWNER_ID, new CreateSpaceRequest("알파", null, "2026-05-01", "2026-05-31"));
		assertThat(result.space().id()).isEqualTo("spc_alpha");
		assertThat(result.space().startDate()).isEqualTo("2026-05-01");
	}

	@Test void 생성시이름이비면400이다() {
		assertThatThrownBy(() -> service.createSpace(OWNER_ID, new CreateSpaceRequest(" ", null, null, null)))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("스페이스 이름은 필수입니다.");
	}

	@Test void 수정시시작일변경은거절한다() {
		when(repository.findOwnedByPublicId(OWNER_ID, "spc_alpha"))
			.thenReturn(new SpaceRepository.SpaceRow(1L, "spc_alpha", "알파", null, "2026-05-01", "2026-05-31", OWNER_ID.toString(), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z")));

		assertThatThrownBy(() -> service.updateSpace(OWNER_ID, "spc_alpha", new UpdateSpaceRequest(null, "2026-06-01", null)))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("진행 시작일은 변경할 수 없습니다.");
	}

	@Test void 삭제대상이없으면404다() {
		when(repository.deleteOwnedSpace(OWNER_ID, "spc_missing")).thenReturn(false);

		assertThatThrownBy(() -> service.deleteSpace(OWNER_ID, "spc_missing"))
			.isInstanceOf(SpaceServiceException.class)
			.hasMessage("삭제할 스페이스를 찾지 못했습니다.");
	}
}
