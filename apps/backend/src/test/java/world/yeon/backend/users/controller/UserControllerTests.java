package world.yeon.backend.users.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.users.dto.CreateUserRequest;
import world.yeon.backend.users.dto.CreateUserResponse;
import world.yeon.backend.users.dto.GetUsersResponse;
import world.yeon.backend.users.dto.UserResponse;
import world.yeon.backend.users.service.UserService;
import world.yeon.backend.users.service.UserServiceException;

@WebMvcTest(UserController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class UserControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000931");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private UserService service;

	@Test void list응답shape를반환한다() throws Exception {
		when(service.listUsers(eq(OWNER_ID))).thenReturn(new GetUsersResponse(List.of(
			new UserResponse("550e8400-e29b-41d4-a716-446655440000", "user@yeon.world", "유저", "user", OffsetDateTime.parse("2026-05-08T08:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
		)));

		mockMvc.perform(get("/users").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.users[0].email").value("user@yeon.world"))
			.andExpect(jsonPath("$.users[0].role").value("user"))
			.andExpect(jsonPath("$.users[0].lastLoginAt").value("2026-05-08T08:00:00Z"));
	}

	@Test void create응답shape를반환한다() throws Exception {
		when(service.createUser(eq(OWNER_ID), eq(new CreateUserRequest("user@yeon.world", "유저"))))
			.thenReturn(new CreateUserResponse(new UserResponse("550e8400-e29b-41d4-a716-446655440000", "user@yeon.world", "유저", "user", OffsetDateTime.parse("2026-05-08T08:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))));

		mockMvc.perform(post("/users").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"user@yeon.world\",\"displayName\":\"유저\"}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.user.id").value("550e8400-e29b-41d4-a716-446655440000"));
	}

	@Test void duplicateEmail은409를반환한다() throws Exception {
		when(service.createUser(eq(OWNER_ID), eq(new CreateUserRequest("user@yeon.world", "유저"))))
			.thenThrow(new UserServiceException(409, "DUPLICATE_EMAIL", "이미 등록된 이메일입니다."));

		mockMvc.perform(post("/users").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"user@yeon.world\",\"displayName\":\"유저\"}"))
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.message").value("이미 등록된 이메일입니다."));
	}

	@Test void 관리자권한오류는403을반환한다() throws Exception {
		when(service.listUsers(eq(OWNER_ID)))
			.thenThrow(new UserServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다."));

		mockMvc.perform(get("/users").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.message").value("관리자 권한이 필요합니다."));
	}
}
