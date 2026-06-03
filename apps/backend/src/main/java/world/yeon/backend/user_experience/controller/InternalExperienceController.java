package world.yeon.backend.user_experience.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.dto.InternalAwardExperienceRequest;
import world.yeon.backend.user_experience.service.ExperienceService;

/**
 * 내부 서비스 전용 경험치 적립 엔드포인트.
 *
 * <p>신뢰 경계: SecurityConfig 가 {@code /api/v1/internal/**} 를 {@code hasRole("INTERNAL")} 로
 * 막는다. ROLE_INTERNAL 권한은 InternalServiceTokenAuthFilter(X-Yeon-Internal-Token)가 토큰
 * 검증에 성공한 요청에만 부여하므로, 유효한 내부 토큰을 가진 BFF/서버만 이 엔드포인트에 도달한다.
 * (메서드 시큐리티는 비활성이라 URL 기반 authorize 로 경계를 둔다.)
 *
 * <p>임의 적립 차단: activityType 은 {@link ExperienceActivity#internalAwardableFromKey}
 * 화이트리스트로만 해석되어, 내부 호출자라도 정의된 내부 적립 활동(타자 레이스 완료 등) 외에는
 * 적립할 수 없다. 적립 자체는 {@link ExperienceService#award} 가 멱등·동시 안전하게 처리한다.
 */
@RestController
@RequestMapping("/api/v1/internal/experience")
public class InternalExperienceController {
  private static final Logger log = LoggerFactory.getLogger(InternalExperienceController.class);

  private final ExperienceService service;

  public InternalExperienceController(ExperienceService service) {
    this.service = service;
  }

  @PostMapping("/award")
  public ResponseEntity<AwardResult> award(@RequestBody InternalAwardExperienceRequest request) {
    if (request == null || request.userId() == null) {
      return ResponseEntity.badRequest().body(new AwardResult(false, "적립 대상 유저 id가 필요합니다."));
    }
    if (request.referenceId() == null || request.referenceId().isBlank()) {
      return ResponseEntity.badRequest().body(new AwardResult(false, "멱등 키(referenceId)가 필요합니다."));
    }
    var activity = ExperienceActivity.internalAwardableFromKey(request.activityType());
    if (activity.isEmpty()) {
      // 화이트리스트 밖 activityType 은 거부한다(임의 적립 차단).
      log.warn("내부 경험치 적립 거부: 허용되지 않은 활동 유형입니다. activityType={}", request.activityType());
      return ResponseEntity.badRequest().body(new AwardResult(false, "허용되지 않은 활동 유형입니다."));
    }
    service.award(request.userId(), activity.get(), request.referenceId().trim());
    return ResponseEntity.ok(new AwardResult(true, null));
  }

  @org.springframework.web.bind.annotation.ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<AwardResult> handleBadRequest(IllegalArgumentException error) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AwardResult(false, error.getMessage()));
  }

  public record AwardResult(boolean awarded, String message) {}
}
