package world.yeon.backend.public_check_runtime.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.public_check_runtime.dto.SubmitPublicCheckRequest;
import world.yeon.backend.public_check_runtime.dto.VerifyPublicCheckIdentityRequest;
import world.yeon.backend.public_check_runtime.repository.PublicCheckRuntimeRepository;

@ExtendWith(MockitoExtension.class)
class PublicCheckRuntimeServiceTests {
	@Mock private PublicCheckRuntimeRepository repository;
	private PublicCheckRuntimeService service;

	@BeforeEach void setUp() { service = new PublicCheckRuntimeService(repository); }

	@Test void getSession은rememberedMember를복원한다() {
		when(repository.findSessionByPublicToken("token123")).thenReturn(new PublicCheckRuntimeRepository.SessionContextRow(1L, "pcs_1", 10L, "space-1", "오늘 출석 체크", "active", "attendance_and_assignment", List.of("qr"), null, null, null, null, null, null, "token123"));
		when(repository.findMemberByPublicId(10L, "member-1")).thenReturn(new PublicCheckRuntimeRepository.MemberRow(100L, "member-1", "홍길동", "010-1111-1234"));
		var result = service.getSession("token123", "qr", List.of("space-1:member-1"));
		assertThat(result.session().rememberedMemberName()).isEqualTo("홍길동");
		assertThat(result.session().requiresPhoneLast4()).isFalse();
	}

	@Test void verify는member를찾아rememberedMemberId를반환한다() {
		when(repository.findSessionByPublicToken("token123")).thenReturn(new PublicCheckRuntimeRepository.SessionContextRow(1L, "pcs_1", 10L, "space-1", "오늘 출석 체크", "active", "attendance_and_assignment", List.of("qr"), null, null, null, null, null, null, "token123"));
		when(repository.findMembersInSpace(10L)).thenReturn(List.of(new PublicCheckRuntimeRepository.MemberRow(100L, "member-1", "홍길동", "010-1111-1234")));
		var result = service.verifyIdentity("token123", new VerifyPublicCheckIdentityRequest("홍길동", "1234"));
		assertThat(result.rememberedMemberId()).isEqualTo("member-1");
		assertThat(result.result().verificationStatus()).isEqualTo("matched");
	}

	@Test void submit은board와submission을쓴다() {
		when(repository.findSessionByPublicToken("token123")).thenReturn(new PublicCheckRuntimeRepository.SessionContextRow(1L, "pcs_1", 10L, "space-1", "오늘 출석 체크", "active", "attendance_and_assignment", List.of("qr"), null, null, null, null, null, null, "token123"));
		when(repository.findMembersInSpace(10L)).thenReturn(List.of(new PublicCheckRuntimeRepository.MemberRow(100L, "member-1", "홍길동", "010-1111-1234")));
		when(repository.findBoardSnapshot(10L, 100L)).thenReturn(null);
		var result = service.submit("token123", new SubmitPublicCheckRequest("qr", "홍길동", "1234", "done", null, null, null, List.of()));
		assertThat(result.result().verificationStatus()).isEqualTo("matched");
		verify(repository).upsertBoardSnapshot(any(), eq(10L), eq(100L), eq("present"), any(), eq("public_qr"), eq("done"), eq(null), any(), eq("public_qr"), any(), any());
		verify(repository).insertBoardHistory(any(), eq(10L), eq(100L), eq(1L), eq("present"), eq("done"), eq(null), eq("public_qr"), any());
		verify(repository).insertSubmission(any(), eq(1L), eq(10L), eq(100L), eq("qr"), eq("matched"), eq("홍길동"), eq("1234"), eq("done"), eq(null), eq(null), eq(null), eq(null), eq(null));
	}
}
