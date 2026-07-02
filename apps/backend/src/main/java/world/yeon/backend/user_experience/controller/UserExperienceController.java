package world.yeon.backend.user_experience.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.user_experience.dto.ExperienceHistoryResponse;
import world.yeon.backend.user_experience.dto.UserExperienceView;
import world.yeon.backend.user_experience.service.ExperienceService;
import world.yeon.backend.user_experience.service.ExperienceServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@RestController
@RequestMapping("/api/v1/user-experience")
public class UserExperienceController {
  private static final int DEFAULT_HISTORY_LIMIT = 50;

  private final ExperienceService service;

  public UserExperienceController(ExperienceService service) {
    this.service = service;
  }

  // 신뢰 경계: X-Yeon-User-Id는 InternalServiceTokenAuthFilter(BFF) 뒤에서만 신뢰된다.
  @GetMapping
  public UserExperienceView getProgress(@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId) {
    return service.getProgress(userId);
  }

  @GetMapping("/history")
  public ExperienceHistoryResponse getHistory(
    @RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
    @RequestParam(value = "limit", required = false) Integer limit
  ) {
    int resolvedLimit = limit == null ? DEFAULT_HISTORY_LIMIT : limit;
    return new ExperienceHistoryResponse(service.getHistory(userId, resolvedLimit));
  }

  @ExceptionHandler(ExperienceServiceException.class)
  public ResponseEntity<ApiErrorResponse> handleServiceError(ExperienceServiceException error) {
    return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
  }
}
