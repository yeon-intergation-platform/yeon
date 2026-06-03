package world.yeon.backend.users.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.users.dto.CreateUserRequest;
import world.yeon.backend.users.dto.CreateUserResponse;
import world.yeon.backend.users.dto.GetUsersResponse;
import world.yeon.backend.users.service.UserService;
import world.yeon.backend.users.service.UserServiceException;

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

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(UserServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(UserServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
