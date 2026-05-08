package world.yeon.backend.public_check_sessions.service;

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
import world.yeon.backend.public_check_sessions.dto.CreatePublicCheckSessionRequest;
import world.yeon.backend.public_check_sessions.dto.UpdatePublicCheckSessionRequest;
import world.yeon.backend.public_check_sessions.repository.PublicCheckSessionRepository;

@ExtendWith(MockitoExtension.class)
class PublicCheckSessionServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000941");
	@Mock private PublicCheckSessionRepository repository;
	private PublicCheckSessionService service;

	@BeforeEach void setUp() {
		service = new PublicCheckSessionService(repository);
	}

	@Test void invalidStatus면400이다() {
		when(repository.findOwnedSpaceInternalId("space_alpha", OWNER_ID)).thenReturn(11L);
		assertThatThrownBy(() -> service.updateSession("space_alpha", "pcs_1", OWNER_ID, new UpdatePublicCheckSessionRequest("bad", null)))
			.isInstanceOf(IllegalArgumentException.class);
	}

	@Test void update응답을반환한다() {
		when(repository.findOwnedSpaceInternalId("space_alpha", OWNER_ID)).thenReturn(11L);
		when(repository.updateOwnedSession(eq(11L), eq("pcs_1"), eq("closed"), any(), any()))
			.thenReturn(new PublicCheckSessionRepository.SessionRow(31L, "pcs_1", "체크인", "closed", "attendance_and_assignment", List.of("qr"), "token123", null, OffsetDateTime.parse("2026-05-08T09:00:00Z"), null, null, OffsetDateTime.parse("2026-05-08T07:00:00Z")));
		var result = service.updateSession("space_alpha", "pcs_1", OWNER_ID, new UpdatePublicCheckSessionRequest("closed", "2026-05-08T09:00:00Z"));
		assertThat(result.session().id()).isEqualTo("pcs_1");
		assertThat(result.session().publicPath()).isEqualTo("/check/token123");
	}

	@Test void create응답을반환한다() {
		when(repository.findOwnedSpaceInternalId("space_alpha", OWNER_ID)).thenReturn(11L);
		when(repository.insertSession(eq(11L), any(), eq("체크인"), any(), eq("active"), eq("attendance_and_assignment"), eq(List.of("qr")), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(OWNER_ID), any()))
			.thenReturn(new PublicCheckSessionRepository.SessionRow(31L, "pcs_1", "체크인", "active", "attendance_and_assignment", List.of("qr"), "token123", null, null, null, null, OffsetDateTime.parse("2026-05-08T07:00:00Z")));
		var result = service.createSession("space_alpha", OWNER_ID, new CreatePublicCheckSessionRequest("체크인", "attendance_and_assignment", List.of("qr"), null, null, null, null, null, null));
		assertThat(result.session().id()).isEqualTo("pcs_1");
	}
}
