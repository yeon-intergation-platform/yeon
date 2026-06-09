package world.yeon.backend.root_auth.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import world.yeon.backend.root_auth.dto.RootAuthSessionCreateResponse;
import world.yeon.backend.root_auth.repository.AuthSessionRepository;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.service.ExperienceService;

@Service
public class AuthSessionIssuer {
	private static final Logger log = LoggerFactory.getLogger(AuthSessionIssuer.class);
	private static final long AUTH_SESSION_TTL_DAYS = 30;

	private final AuthSessionRepository repository;
	private final AuthTokenHasher tokenHasher;
	private final AuthSessionTokenGenerator tokenGenerator;
	private final ExperienceService experienceService;

	public AuthSessionIssuer(
		AuthSessionRepository repository,
		AuthTokenHasher tokenHasher,
		AuthSessionTokenGenerator tokenGenerator,
		ExperienceService experienceService
	) {
		this.repository = repository;
		this.tokenHasher = tokenHasher;
		this.tokenGenerator = tokenGenerator;
		this.experienceService = experienceService;
	}

	public RootAuthSessionCreateResponse createSession(String userId) {
		String sessionToken = tokenGenerator.createToken();
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		OffsetDateTime expiresAt = now.plusDays(AUTH_SESSION_TTL_DAYS);
		repository.insertAuthSession(UUID.randomUUID().toString(), userId, tokenHasher.hash(sessionToken), expiresAt, now);
		awardDailyLogin(userId, now);
		return new RootAuthSessionCreateResponse(userId, sessionToken, expiresAt);
	}

	// 출석 경험치(하루 1회). 멱등 키는 오늘 UTC 날짜(yyyy-MM-dd)라 같은 날 여러 번 로그인해도 1회만 적립된다.
	// 적립 실패가 세션 발급(로그인)을 깨지 않도록 별도 트랜잭션(REQUIRES_NEW) + try/catch로 방어한다.
	private void awardDailyLogin(String userId, OffsetDateTime now) {
		try {
			UUID parsedUserId = UUID.fromString(userId);
			String today = now.toLocalDate().toString();
			experienceService.award(parsedUserId, ExperienceActivity.DAILY_LOGIN, today);
		} catch (RuntimeException error) {
			log.warn("출석 경험치 적립에 실패했습니다(로그인은 정상). userId={}", userId, error);
		}
	}
}
