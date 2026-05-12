package world.yeon.backend.member_risk_profiles.controller;

import java.util.UUID;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfilesRequest;
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfilesResponse;
import world.yeon.backend.member_risk_profiles.service.MemberRiskProfileService;

@Validated
@RestController
public class MemberRiskProfileController {
	private final MemberRiskProfileService service;

	public MemberRiskProfileController(MemberRiskProfileService service) {
		this.service = service;
	}

	@PostMapping("/member-risk-profiles")
	public MemberRiskProfilesResponse getProfiles(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody MemberRiskProfilesRequest request
	) {
		return service.getProfiles(userId, request);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleUnhandled(Exception error) {
		return ResponseEntity.status(500).body(new ErrorResponse("INTERNAL_ERROR", error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
