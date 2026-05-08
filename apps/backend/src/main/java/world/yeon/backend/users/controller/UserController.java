package world.yeon.backend.users.controller;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
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
@Profile("jdbc")
public class UserController {
	private final UserService service;

	public UserController(UserService service) {
		this.service = service;
	}

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
