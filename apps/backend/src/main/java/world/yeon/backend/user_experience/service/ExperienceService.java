package world.yeon.backend.user_experience.service;

import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.domain.LevelCurve;
import world.yeon.backend.user_experience.dto.ExperienceHistoryResponse.ExperienceHistoryItem;
import world.yeon.backend.user_experience.dto.UserExperienceView;
import world.yeon.backend.user_experience.repository.ExperienceRepository;
import world.yeon.backend.user_experience.repository.ExperienceRepository.ExperienceLogRow;

@Service
public class ExperienceService {
  private static final Logger log = LoggerFactory.getLogger(ExperienceService.class);
  private static final int DEFAULT_HISTORY_LIMIT = 50;
  private static final int MAX_HISTORY_LIMIT = 200;

  private final ExperienceRepository repository;

  public ExperienceService(ExperienceRepository repository) {
    this.repository = repository;
  }

  /**
   * 경험치 적립(멱등 · 동시 안전). 트리거(덱 생성 등) 동작과 분리된 독립 트랜잭션(REQUIRES_NEW)으로
   * 수행해 적립 실패가 호출부 트랜잭션을 오염시키지 않게 한다. 호출부는 추가로 try/catch로 감싼다.
   *
   * <p>멱등성 보장: 로그 placeholder를 {@code on conflict do nothing}으로 먼저 삽입해 가드 행을
   * 선점한다. 0행이면(이미 적립됨) 즉시 종료한다. 삽입에 성공한 호출만 누적 경험치를 올리고
   * 로그의 total_xp_after를 확정한다. 동시 중복 호출이 와도 유니크 제약 + ON CONFLICT로 1회만
   * 누적이 일어난다.
   *
   * @param userId 적립 대상(게스트면 null → 무시)
   * @param activity 활동 유형(기본 적립량 포함)
   * @param referenceId 멱등 키의 참조 식별자(예: deckPublicId, roomPublicId, yyyy-MM-dd)
   */
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void award(UUID userId, ExperienceActivity activity, String referenceId) {
    if (userId == null) {
      return; // 게스트는 적립 대상이 아니다.
    }
    if (activity == null || referenceId == null || referenceId.isBlank()) {
      log.warn("경험치 적립 요청이 올바르지 않습니다(activity 또는 referenceId 누락). userId={}", userId);
      return;
    }
    int xp = activity.defaultXp();
    boolean inserted = repository.insertLogIfAbsent(userId, activity.key(), xp, referenceId);
    if (!inserted) {
      return; // 이미 적립된 (user, activity, reference) — 멱등 skip.
    }
    long totalAfter = repository.upsertAddXp(userId, xp);
    repository.updateLogTotalAfter(userId, activity.key(), referenceId, totalAfter);
  }

  /** 현재 유저의 레벨/경험치 진행도. */
  @Transactional(readOnly = true)
  public UserExperienceView getProgress(UUID userId) {
    if (userId == null) {
      throw new ExperienceServiceException(401, "AUTH_REQUIRED", "로그인이 필요합니다.");
    }
    long totalXp = repository.findTotalXp(userId);
    LevelCurve.Progress progress = LevelCurve.progress(totalXp);
    return new UserExperienceView(progress.level(), progress.totalXp(), progress.xpIntoLevel(), progress.xpForNextLevel());
  }

  /** 현재 유저의 적립 이력. */
  @Transactional(readOnly = true)
  public List<ExperienceHistoryItem> getHistory(UUID userId, int limit) {
    if (userId == null) {
      throw new ExperienceServiceException(401, "AUTH_REQUIRED", "로그인이 필요합니다.");
    }
    int normalized = limit <= 0 ? DEFAULT_HISTORY_LIMIT : Math.min(limit, MAX_HISTORY_LIMIT);
    return repository.listLog(userId, normalized).stream().map(this::toHistoryItem).toList();
  }

  private ExperienceHistoryItem toHistoryItem(ExperienceLogRow row) {
    return new ExperienceHistoryItem(
      row.activityType(),
      row.xpAmount(),
      row.referenceId(),
      row.totalXpAfter(),
      row.createdAt() == null ? null : row.createdAt().toInstant().toString()
    );
  }
}
