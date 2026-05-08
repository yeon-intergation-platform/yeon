package world.yeon.backend.users.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import jakarta.persistence.PersistenceException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.users.dto.CreateUserRequest;
import world.yeon.backend.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000932");
	@Mock private UserRepository repository;
	private UserService service;

	@BeforeEach void setUp() {
		service = new UserService(repository);
	}

	@Test void 목록응답을반환한다() {
		when(repository.listUsers()).thenReturn(List.of(
			new UserRepository.UserRow("550e8400-e29b-41d4-a716-446655440000", "user@yeon.world", "유저", OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
		));

		var result = service.listUsers(OWNER_ID);
		assertThat(result.users()).hasSize(1);
	}

	@Test void 생성시이메일을정규화한다() {
		when(repository.findByEmail("user@yeon.world")).thenReturn(null);
		when(repository.insertUser(any(), eq("user@yeon.world"), eq("유저"), any()))
			.thenReturn(new UserRepository.UserRow("550e8400-e29b-41d4-a716-446655440000", "user@yeon.world", "유저", OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z")));

		var result = service.createUser(OWNER_ID, new CreateUserRequest(" User@Yeon.World ", " 유저 "));
		assertThat(result.user().email()).isEqualTo("user@yeon.world");
		assertThat(result.user().displayName()).isEqualTo("유저");
	}

	@Test void 중복이메일이면409다() {
		when(repository.findByEmail("user@yeon.world")).thenReturn(
			new UserRepository.UserRow("550e8400-e29b-41d4-a716-446655440000", "user@yeon.world", "유저", OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
		);

		assertThatThrownBy(() -> service.createUser(OWNER_ID, new CreateUserRequest("user@yeon.world", "유저")))
			.isInstanceOf(UserServiceException.class)
			.hasMessage("이미 등록된 이메일입니다.");
	}

	@Test void dbUnique충돌도409다() {
		when(repository.findByEmail("user@yeon.world")).thenReturn(null);
		when(repository.insertUser(any(), eq("user@yeon.world"), eq(null), any()))
			.thenThrow(new PersistenceException("duplicate key value violates unique constraint \"users_email_key\""));

		assertThatThrownBy(() -> service.createUser(OWNER_ID, new CreateUserRequest("user@yeon.world", null)))
			.isInstanceOf(UserServiceException.class)
			.hasMessage("이미 등록된 이메일입니다.");
	}
}
