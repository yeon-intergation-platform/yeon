package world.yeon.backend.member_field_values.read.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_field_values.read.dto.MemberFieldValueDetailedListResponse;
import world.yeon.backend.member_field_values.read.repository.MemberFieldValueReadRepository;

@ExtendWith(MockitoExtension.class)
class MemberFieldValueMemberReadServiceTests {

	@Mock private MemberFieldValueReadRepository repository;
	private MemberFieldValueReadService service;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void setUp() { service = new MemberFieldValueReadService(repository); }

	@Test
	void memberRouteValues목록을응답shape로반환한다() throws Exception {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findMemberInternalId("mem_1", 11L)).thenReturn(21L);
		when(repository.findDetailedValues(21L, 11L, List.of("mfd_status", "mfd_note"))).thenReturn(List.of(
			new MemberFieldValueReadRepository.DetailedValueRow("mfd_status", "select", "상태", null, null, null, objectMapper.readTree("[\"in_progress\"]")),
			new MemberFieldValueReadRepository.DetailedValueRow("mfd_note", "text", "메모", "메모값", null, null, null)
		));

		MemberFieldValueDetailedListResponse result = service.listMemberValues("space_alpha", "mem_1", List.of("mfd_status", "mfd_note"));
		assertThat(result.values()).hasSize(2);
		assertThat(result.values().getFirst().fieldType()).isEqualTo("select");
		assertThat(result.values().getFirst().valueJson()).isInstanceOf(List.class);
		assertThat(result.values().get(1).fieldName()).isEqualTo("메모");
	}

	@Test
	void member가없으면notFound다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findMemberInternalId("missing", 11L)).thenReturn(null);

		assertThatThrownBy(() -> service.listMemberValues("space_alpha", "missing", List.of()))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("수강생을 찾지 못했습니다.");
	}
}
