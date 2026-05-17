package world.yeon.backend.card_rooms.service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CardRoomCleanupScheduler {
  private static final Logger log = LoggerFactory.getLogger(CardRoomCleanupScheduler.class);

  private final CardRoomService service;
  private final Duration staleAfter;

  public CardRoomCleanupScheduler(CardRoomService service, @Value("${yeon.card-rooms.cleanup.stale-after:PT6H}") String staleAfter) {
    this.service = service;
    this.staleAfter = parsePositiveDuration(staleAfter);
  }

  @EventListener(ApplicationReadyEvent.class)
  public void cleanupOnStartup() {
    cleanup("기동");
  }

  @Scheduled(
    fixedDelayString = "${yeon.card-rooms.cleanup.fixed-delay-ms:900000}",
    initialDelayString = "${yeon.card-rooms.cleanup.initial-delay-ms:60000}"
  )
  public void cleanupPeriodically() {
    cleanup("주기");
  }

  private void cleanup(String source) {
    int closedCount = service.cleanupStaleRooms(OffsetDateTime.now(ZoneOffset.UTC), staleAfter);
    if (closedCount > 0) {
      log.info("카드방 잔존 정리 완료: source={}, closedCount={}", source, closedCount);
    }
  }

  private Duration parsePositiveDuration(String rawValue) {
    try {
      Duration parsed = Duration.parse(rawValue);
      if (!parsed.isNegative() && !parsed.isZero()) return parsed;
    } catch (RuntimeException ignored) {
      log.warn("카드방 잔존 정리 TTL 설정이 올바르지 않아 기본값을 사용합니다: {}", rawValue);
    }
    return Duration.ofHours(6);
  }
}
