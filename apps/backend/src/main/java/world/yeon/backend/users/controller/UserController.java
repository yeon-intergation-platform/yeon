package world.yeon.backend.users.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.users.dto.CreateUserRequest;
import world.yeon.backend.users.dto.CreateUserResponse;
import world.yeon.backend.users.dto.DeleteUserResponse;
import world.yeon.backend.users.dto.GetUsersResponse;
import world.yeon.backend.users.dto.InvalidateUserSessionsResponse;
import world.yeon.backend.users.dto.UpdateUserRequest;
import world.yeon.backend.users.dto.UpdateUserResponse;
import world.yeon.backend.users.dto.UpdateUserRoleRequest;
import world.yeon.backend.users.service.UserService;
import world.yeon.backend.users.service.UserServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
public class UserController {
	private final UserService service;

	public UserController(UserService service) {
		this.service = service;
	}

	// 신뢰 경계: X-Yeon-User-Id는 InternalServiceTokenAuthFilter(BFF) 뒤에서만 신뢰된다.
	// 게이트웨이가 외부 유입 X-Yeon-User-Id 헤더를 strip한다는 전제 하에 신원으로 사용한다.
	@GetMapping("/users")
	public GetUsersResponse listUsers(@RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.listUsers(userId);
	}

	@PostMapping("/users")
	public ResponseEntity<CreateUserResponse> createUser(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody CreateUserRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createUser(userId, request));
	}

	@PatchMapping("/users/{targetUserId}")
	public UpdateUserResponse updateUser(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable UUID targetUserId, @RequestBody UpdateUserRequest request) {
		return service.updateUser(userId, targetUserId, request);
	}

	@PatchMapping("/users/{targetUserId}/role")
	public UpdateUserResponse updateUserRole(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable UUID targetUserId, @RequestBody UpdateUserRoleRequest request) {
		return service.updateUserRole(userId, targetUserId, request);
	}

	@PostMapping("/users/{targetUserId}/sessions/invalidate")
	public InvalidateUserSessionsResponse invalidateUserSessions(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable UUID targetUserId) {
		return service.invalidateUserSessions(userId, targetUserId);
	}

	@DeleteMapping("/users/{targetUserId}")
	public DeleteUserResponse deleteUser(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable UUID targetUserId) {
		return service.deleteUser(userId, targetUserId);
	}

	@DeleteMapping("/users/me")
	public DeleteUserResponse deleteMe(@RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.deleteMe(userId);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(UserServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(UserServiceException error) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}
}
