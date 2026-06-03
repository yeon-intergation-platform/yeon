package world.yeon.backend.member_field_values.read.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_field_values.read.dto.MemberFieldValueListResponse;
import world.yeon.backend.member_field_values.read.repository.MemberFieldValueReadRepository;
import world.yeon.backend.space_access.service.SpaceAccessService;

@ExtendWith(MockitoExtension.class)
class MemberFieldValueReadServiceTests {

	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

	@Mock
	private MemberFieldValueReadRepository repository;

	@Mock
	private SpaceAccessService spaceAccessService;

	private MemberFieldValueReadService service;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void setUp() {
		service = new MemberFieldValueReadService(repository, spaceAccessService);
	}

	@Test
	void values목록을응답shape로반환한다() throws Exception {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findTabLookup("mtb_custom")).thenReturn(new MemberFieldValueReadRepository.TabLookup(21L, 11L));
		when(repository.findMemberInternalId("mem_1", 11L)).thenReturn(31L);
		when(repository.findFieldDefinitionIds(11L, 21L)).thenReturn(List.of(41L, 42L));
		when(repository.findValues(31L, 11L, List.of(41L, 42L))).thenReturn(List.of(
			new MemberFieldValueReadRepository.ValueRow("mfd_status", null, null, null, objectMapper.readTree("[\"in_progress\"]")),
			new MemberFieldValueReadRepository.ValueRow("mfd_note", "메모값", null, null, null)
		));

		MemberFieldValueListResponse result = service.listValues(USER_ID, "space_alpha", "mtb_custom", "mem_1");
		assertThat(result.values()).hasSize(2);
		assertThat(result.values().getFirst().fieldDefinitionId()).isEqualTo("mfd_status");
		assertThat(result.values().getFirst().valueJson()).isInstanceOf(List.class);
		@SuppressWarnings("unchecked")
		List<Object> valueJson = (List<Object>) result.values().getFirst().valueJson();
		assertThat(valueJson).containsExactly("in_progress");
		assertThat(result.values().get(1).valueText()).isEqualTo("메모값");
	}

	@Test
	void member가없으면notFound다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findTabLookup("mtb_custom")).thenReturn(new MemberFieldValueReadRepository.TabLookup(21L, 11L));
		when(repository.findMemberInternalId("missing", 11L)).thenReturn(null);
		assertThatThrownBy(() -> service.listValues(USER_ID, "space_alpha", "mtb_custom", "missing"))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("수강생을 찾지 못했습니다.");
	}
}
