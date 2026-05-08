package world.yeon.backend.members.service;

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

import world.yeon.backend.members.dto.BulkDeleteMembersRequest;
import world.yeon.backend.members.dto.CreateMemberRequest;
import world.yeon.backend.members.dto.UpdateMemberRequest;
import world.yeon.backend.members.repository.MemberCrudRepository;

@ExtendWith(MockitoExtension.class)
class MemberCrudServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000911");
	@Mock private MemberCrudRepository repository;
	private MemberCrudService service;

	@BeforeEach void setUp() { service = new MemberCrudService(repository); }

	@Test void 생성응답을반환한다() {
		when(repository.findOwnedSpaceInternalId("space_alpha", OWNER_ID)).thenReturn(11L);
		when(repository.insertMember(eq(11L), any(), eq("홍길동"), eq(null), eq(null), eq("active"), eq(null), any()))
			.thenReturn(new MemberCrudRepository.MemberRow(21L, 11L, "mem_1", "space_alpha", "홍길동", null, null, "active", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z")));
		var result = service.createMember("space_alpha", OWNER_ID, new CreateMemberRequest("홍길동", null, null, null, null));
		assertThat(result.member().id()).isEqualTo("mem_1");
	}

	@Test void 빈이름이면400이다() {
		when(repository.findOwnedSpaceInternalId("space_alpha", OWNER_ID)).thenReturn(11L);
		assertThatThrownBy(() -> service.createMember("space_alpha", OWNER_ID, new CreateMemberRequest("   ", null, null, null, null))).isInstanceOf(IllegalArgumentException.class);
	}

	@Test void 수정응답을반환한다() {
		when(repository.findOwnedMemberInSpace("space_alpha", "mem_1", OWNER_ID)).thenReturn(new MemberCrudRepository.MemberRow(21L, 11L, "mem_1", "space_alpha", "홍길동", null, null, "active", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z")));
		when(repository.updateMember(eq(21L), eq("김철수"), eq(null), eq(null), eq("active"), eq(null), any()))
			.thenReturn(new MemberCrudRepository.MemberRow(21L, 11L, "mem_1", "space_alpha", "김철수", null, null, "active", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:10:00Z")));
		var result = service.updateMember("space_alpha", "mem_1", OWNER_ID, new UpdateMemberRequest("김철수", null, null, null, null));
		assertThat(result.member().name()).isEqualTo("김철수");
	}

	@Test void bulkDelete결과를반환한다() {
		when(repository.findOwnedSpaceInternalId("space_alpha", OWNER_ID)).thenReturn(11L);
		when(repository.findOwnedMembersInSpace("space_alpha", OWNER_ID, List.of("mem_1", "mem_2"))).thenReturn(List.of(
			new MemberCrudRepository.MemberRow(1L,11L,"mem_1","space_alpha","A",null,null,"active",null,OffsetDateTime.parse("2026-05-08T07:00:00Z"),OffsetDateTime.parse("2026-05-08T07:00:00Z")),
			new MemberCrudRepository.MemberRow(2L,11L,"mem_2","space_alpha","B",null,null,"active",null,OffsetDateTime.parse("2026-05-08T07:00:00Z"),OffsetDateTime.parse("2026-05-08T07:00:00Z"))));
		when(repository.deleteMembersInSpace("space_alpha", OWNER_ID, List.of("mem_1", "mem_2"))).thenReturn(List.of("mem_1", "mem_2"));
		var result = service.bulkDeleteMembers("space_alpha", OWNER_ID, new BulkDeleteMembersRequest(List.of("mem_1", "mem_2", "mem_1")));
		assertThat(result.deletedCount()).isEqualTo(2);
	}
}
