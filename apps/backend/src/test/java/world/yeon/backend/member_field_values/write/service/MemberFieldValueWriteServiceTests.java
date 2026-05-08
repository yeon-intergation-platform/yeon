package world.yeon.backend.member_field_values.write.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_field_values.write.dto.BulkUpsertMemberFieldValuesRequest;
import world.yeon.backend.member_field_values.write.dto.MemberFieldValuePayloadRequest;
import world.yeon.backend.member_field_values.write.repository.MemberFieldValueWriteRepository;

@ExtendWith(MockitoExtension.class)
class MemberFieldValueWriteServiceTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000788");
	@Mock private MemberFieldValueWriteRepository repository;
	private MemberFieldValueWriteService service;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void setUp() { service = new MemberFieldValueWriteService(repository); }

	@Test
	void bulkUpsert는응답values를반환한다() throws Exception {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findMemberInternalId("mem_1", 11L)).thenReturn(21L);
		when(repository.findDefinitions(11L, List.of("mfd_status", "mfd_note"))).thenReturn(List.of(
			new MemberFieldValueWriteRepository.DefinitionRow(31L, "mfd_status", "select", "상태"),
			new MemberFieldValueWriteRepository.DefinitionRow(32L, "mfd_note", "text", "메모")
		));
		when(repository.findValues(21L, 11L, List.of(31L, 32L))).thenReturn(List.of(
			new MemberFieldValueWriteRepository.ValueRow("mfd_status", "select", "상태", null, null, null, objectMapper.readTree("[\"in_progress\"]")),
			new MemberFieldValueWriteRepository.ValueRow("mfd_note", "text", "메모", "메모값", null, null, null)
		));

		var result = service.bulkUpsert("space_alpha", "mem_1", OWNER_ID, new BulkUpsertMemberFieldValuesRequest(List.of(
			new MemberFieldValuePayloadRequest("mfd_status", List.of("in_progress")),
			new MemberFieldValuePayloadRequest("mfd_note", "메모값")
		)));

		assertThat(result.ok()).isTrue();
		assertThat(result.values()).hasSize(2);
		assertThat(result.values().getFirst().fieldType()).isEqualTo("select");
		assertThat(result.values().getFirst().valueJson()).isInstanceOf(List.class);
		verify(repository).upsertValue(any(), eq(21L), eq(31L), eq(null), eq(null), eq(null), eq("[\"in_progress\"]"));
		verify(repository).upsertValue(any(), eq(21L), eq(32L), eq("메모값"), eq(null), eq(null), eq(null));
	}

	@Test
	void 없는필드정의가있으면404다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findMemberInternalId("mem_1", 11L)).thenReturn(21L);
		when(repository.findDefinitions(11L, List.of("missing"))).thenReturn(List.of());

		assertThatThrownBy(() -> service.bulkUpsert("space_alpha", "mem_1", OWNER_ID, new BulkUpsertMemberFieldValuesRequest(List.of(
			new MemberFieldValuePayloadRequest("missing", "x")
		))))
			.isInstanceOf(MemberFieldValueWriteServiceException.class)
			.hasMessage("필드 정의를 찾지 못했습니다.");
	}

	@Test
	void 숫자필드에문자열이오면400이다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findMemberInternalId("mem_1", 11L)).thenReturn(21L);
		when(repository.findDefinitions(11L, List.of("mfd_number"))).thenReturn(List.of(
			new MemberFieldValueWriteRepository.DefinitionRow(31L, "mfd_number", "number", "점수")
		));

		assertThatThrownBy(() -> service.bulkUpsert("space_alpha", "mem_1", OWNER_ID, new BulkUpsertMemberFieldValuesRequest(List.of(
			new MemberFieldValuePayloadRequest("mfd_number", "abc")
		))))
			.isInstanceOf(MemberFieldValueWriteServiceException.class)
			.hasMessageContaining("숫자 필드에 유효하지 않은 값입니다");
	}
}
