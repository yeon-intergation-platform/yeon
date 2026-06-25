package world.yeon.backend.user_profile.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.user_profile.dto.UserProfileResponse;
import world.yeon.backend.user_profile.service.UserProfileService;

// 현재 사용자 정체성은 웹 BFF가 헤더(X-Yeon-User-Id)로 주입한다.
@RestController
public class UserProfileController {
	private static final String USER_ID_HEADER = "X-Yeon-User-Id";

	private final UserProfileService service;

	public UserProfileController(UserProfileService service) {
		this.service = service;
	}

	@GetMapping("/user-profile/me")
	public UserProfileResponse get(@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId) {
		return service.get(userId);
	}

	@PatchMapping("/user-profile/me")
	public UserProfileResponse update(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@RequestBody UpdateRequest request
	) {
		return service.update(userId, request.displayName(), request.avatarUrl());
	}

	public record UpdateRequest(String displayName, String avatarUrl) {}
}
