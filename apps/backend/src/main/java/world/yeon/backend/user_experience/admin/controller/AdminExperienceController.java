package world.yeon.backend.user_experience.admin.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.user_experience.admin.dto.AdminUserCardDecksResponse;
import world.yeon.backend.user_experience.admin.dto.AdminUserListResponse;
import world.yeon.backend.user_experience.admin.service.AdminExperienceService;
import world.yeon.backend.user_experience.service.ExperienceServiceException;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminExperienceController {
  private final AdminExperienceService service;

  public AdminExperienceController(AdminExperienceService service) {
    this.service = service;
  }

  // 신뢰 경계: X-Yeon-User-Id는 InternalServiceTokenAuthFilter(BFF) 뒤에서만 신뢰된다. requireAdmin으로 게이트.
  @GetMapping("/users")
  public AdminUserListResponse listUsers(@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId) {
    return service.listUsers(userId);
  }

  @GetMapping("/users/{userId}/card-decks")
  public AdminUserCardDecksResponse listCardDecks(
    @RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
    @PathVariable("userId") UUID targetUserId
  ) {
    return service.listCardDecks(callerUserId, targetUserId);
  }

  @ExceptionHandler(ExperienceServiceException.class)
  public ResponseEntity<ErrorResponse> handleServiceError(ExperienceServiceException error) {
    return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
  }

  public record ErrorResponse(String code, String message) {}
}
