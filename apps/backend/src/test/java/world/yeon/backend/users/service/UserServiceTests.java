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
		service = new UserService(repository, "seed-admin@yeon.world");
	}

	@Test void 목록응답을반환한다() {
		when(repository.findById(OWNER_ID)).thenReturn(adminRow());
		when(repository.listUsers()).thenReturn(List.of(
			userRow("550e8400-e29b-41d4-a716-446655440000", "user@yeon.world", "유저", "user")
		));

		var result = service.listUsers(OWNER_ID);
		assertThat(result.users()).hasSize(1);
		assertThat(result.users().getFirst().role()).isEqualTo("user");
	}

	@Test void 생성시이메일을정규화한다() {
		when(repository.findById(OWNER_ID)).thenReturn(adminRow());
		when(repository.insertUser(any(), eq("user@yeon.world"), eq("유저"), any()))
			.thenReturn(userRow("550e8400-e29b-41d4-a716-446655440000", "user@yeon.world", "유저", "user"));

		var result = service.createUser(OWNER_ID, new CreateUserRequest(" User@Yeon.World ", " 유저 "));
		assertThat(result.user().email()).isEqualTo("user@yeon.world");
		assertThat(result.user().displayName()).isEqualTo("유저");
	}

	@Test void 중복이메일이면409다() {
		// 사전 findByEmail 검사를 제거하고 unique(23505) 충돌로 일원화했으므로 insert가 unique 위반을 던진다.
		when(repository.findById(OWNER_ID)).thenReturn(adminRow());
		when(repository.insertUser(any(), eq("user@yeon.world"), eq("유저"), any()))
			.thenThrow(new PersistenceException("duplicate key",
				new java.sql.SQLException("duplicate key value violates unique constraint \"users_email_key\"", "23505")));

		assertThatThrownBy(() -> service.createUser(OWNER_ID, new CreateUserRequest("user@yeon.world", "유저")))
			.isInstanceOf(UserServiceException.class)
			.hasMessage("이미 등록된 이메일입니다.");
	}

	@Test void dbUnique충돌도409다() {
		when(repository.findById(OWNER_ID)).thenReturn(adminRow());
		when(repository.insertUser(any(), eq("user@yeon.world"), eq(null), any()))
			.thenThrow(new PersistenceException("duplicate key",
				new java.sql.SQLException("duplicate key value violates unique constraint \"users_email_key\"", "23505")));

		assertThatThrownBy(() -> service.createUser(OWNER_ID, new CreateUserRequest("user@yeon.world", null)))
			.isInstanceOf(UserServiceException.class)
			.hasMessage("이미 등록된 이메일입니다.");
	}

	@Test void 관리자가아니면목록조회가403이다() {
		when(repository.findById(OWNER_ID)).thenReturn(userRow(OWNER_ID.toString(), "owner@yeon.world", "Owner", "user"));

		assertThatThrownBy(() -> service.listUsers(OWNER_ID))
			.isInstanceOf(UserServiceException.class)
			.hasMessage("관리자 권한이 필요합니다.");
	}

	@Test void 시드이메일이면관리자로허용한다() {
		when(repository.findById(OWNER_ID)).thenReturn(userRow(OWNER_ID.toString(), "seed-admin@yeon.world", "Seed", "user"));
		when(repository.listUsers()).thenReturn(List.of());

		assertThat(service.listUsers(OWNER_ID).users()).isEmpty();
	}

	private UserRepository.UserRow adminRow() {
		return userRow(OWNER_ID.toString(), "admin@yeon.world", "관리자", "admin");
	}

	private UserRepository.UserRow userRow(String id, String email, String displayName, String role) {
		return new UserRepository.UserRow(
			id,
			email,
			displayName,
			role,
			OffsetDateTime.parse("2026-05-08T08:00:00Z"),
			OffsetDateTime.parse("2026-05-08T07:00:00Z"),
			OffsetDateTime.parse("2026-05-08T07:00:00Z")
		);
	}
}
