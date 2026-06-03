package world.yeon.backend.root_auth.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.credential_auth.service.AuthSessionTokenFactory;
import world.yeon.backend.root_auth.dto.*;
import world.yeon.backend.root_auth.repository.AuthSessionRepository;
import world.yeon.backend.root_auth.social.SocialIdentityProfile;
import world.yeon.backend.root_auth.social.SocialIdentityProviderClient;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.service.ExperienceService;

@Service
public class AuthSessionService {
	private static final Logger log = LoggerFactory.getLogger(AuthSessionService.class);
	private static final long AUTH_SESSION_TTL_DAYS = 30;
	private static final long SESSION_TOUCH_THROTTLE_MINUTES = 5;
	private static final int SOCIAL_UPSERT_MAX_RETRIES = 3;
	private static final String DEV_LOGIN_DEFAULT_ACCOUNT_KEY = "default";
	private static final String DEV_USER_EMAIL = "dev@yeon.local";
	private static final String DEV_USER_DISPLAY_NAME = "개발자 기본 계정";
	private static final String DEV_PROVIDER = "dev";
	private static final String DEV_PROVIDER_USER_ID = "dev-local-user";
	private static final String DEV_LOCAL_EMAIL_DOMAIN = "@yeon.local";
	private static final String DEV_LOCAL_EMAIL_PREFIX = "dev+local-";
	private static final String DEV_LOCAL_DISPLAY_NAME_PREFIX = "로컬 테스트 계정 ";
	private static final String ROLE_ADMIN = "admin";
	private static final String ROLE_USER = "user";

	private final AuthSessionRepository repository;
	private final AuthTokenHasher tokenHasher;
	private final AuthSessionTokenFactory tokenFactory;
	private final SocialIdentityProviderClient socialIdentityProviderClient;
	private final Environment environment;
	private final ExperienceService experienceService;

	public AuthSessionService(
		AuthSessionRepository repository,
		AuthTokenHasher tokenHasher,
		AuthSessionTokenFactory tokenFactory,
		SocialIdentityProviderClient socialIdentityProviderClient,
		Environment environment,
		ExperienceService experienceService
	) {
		this.repository = repository;
		this.tokenHasher = tokenHasher;
		this.tokenFactory = tokenFactory;
		this.socialIdentityProviderClient = socialIdentityProviderClient;
		this.environment = environment;
		this.experienceService = experienceService;
	}

	@Transactional
	public AuthSessionResponse getSession(String sessionToken) {
		if (sessionToken == null || sessionToken.isBlank()) {
			return unauthenticated();
		}

		var session = repository.findSessionByTokenHash(tokenHasher.hash(sessionToken));
		if (session == null) {
			return unauthenticated();
		}

		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		if (!session.expiresAt().isAfter(now)) {
			repository.deleteSessionById(session.id());
			return unauthenticated();
		}

		var user = repository.findUserById(session.userId());
		if (user == null) {
			repository.deleteSessionById(session.id());
			return unauthenticated();
		}

		List<String> providers = repository.listProvidersByUserId(user.id());
		if (providers.isEmpty()) {
			repository.deleteSessionById(session.id());
			return unauthenticated();
		}

		// last_accessed_at는 매 요청이 아니라 일정 간격으로만 갱신해 핫패스 쓰기 부하를 줄인다.
		OffsetDateTime lastAccessedAt = session.lastAccessedAt();
		if (lastAccessedAt == null || !lastAccessedAt.isAfter(now.minusMinutes(SESSION_TOUCH_THROTTLE_MINUTES))) {
			repository.touchSession(session.id(), now);
		}
		return authenticated(user, providers);
	}

	@Transactional
	public AuthSessionResponse deleteSession(String sessionToken) {
		if (sessionToken != null && !sessionToken.isBlank()) {
			repository.deleteSessionByTokenHash(tokenHasher.hash(sessionToken));
		}
		return unauthenticated();
	}

	// 신뢰 경계: userId만으로 세션을 발급하므로 반드시 InternalServiceTokenAuthFilter(BFF) 뒤에서만 호출되어야 한다.
	// 외부 입력 userId를 그대로 넘기면 임의 계정 가장이 가능하므로 게이트웨이에서 X-Yeon-User-Id를 strip한다는 전제가 필요하다.
	@Transactional
	public RootAuthSessionCreateResponse createSessionForUser(String userId) {
		var user = userId == null || userId.isBlank() ? null : repository.findUserById(userId);
		if (user == null || repository.listProvidersByUserId(user.id()).isEmpty()) {
			throw new AuthSessionServiceException(404, "AUTH_USER_NOT_FOUND", "인증 사용자를 찾지 못했습니다.");
		}
		return createSession(user.id());
	}

	@Transactional
	public RootAuthSessionCreateResponse completeSocialAuth(SocialAuthCompleteRequest request) {
		String provider = normalizeString(request == null ? null : request.provider(), 20);
		String code = normalizeString(request == null ? null : request.code(), 4096);
		String codeVerifier = normalizeString(request == null ? null : request.codeVerifier(), 128);
		if (!isSocialProvider(provider) || code == null || codeVerifier == null) {
			throw new AuthSessionServiceException(400, "missing_code", "소셜 로그인 요청이 올바르지 않습니다.");
		}
		SocialIdentityProfile profile = socialIdentityProviderClient.fetchProfile(provider, code, codeVerifier, request.appOrigin());
		var user = upsertSocialLogin(profile, 0);
		return createSession(user.id());
	}

	@Transactional
	public DevLoginOptionsResponse listDevLoginOptions() {
		if (!isDevLoginAllowed()) {
			return new DevLoginOptionsResponse(List.of());
		}

		List<AuthSessionRepository.UserRow> users = repository.listUsersForDevLogin();
		List<AuthSessionRepository.IdentityRow> identities = repository.listIdentitiesByUserIds(users.stream().map(AuthSessionRepository.UserRow::id).toList());
		Map<String, List<AuthSessionRepository.IdentityRow>> identitiesByUserId = new LinkedHashMap<>();
		for (var identity : identities) {
			identitiesByUserId.computeIfAbsent(identity.userId(), key -> new ArrayList<>()).add(identity);
		}

		List<DevLoginOptionResponse> options = new ArrayList<>();
		options.add(new DevLoginOptionResponse(DEV_LOGIN_DEFAULT_ACCOUNT_KEY, DEV_USER_EMAIL, DEV_USER_DISPLAY_NAME, List.of(DEV_PROVIDER)));
		for (var user : users) {
			List<String> providers = normalizeProviders(identitiesByUserId.getOrDefault(user.id(), List.of()));
			if (providers.isEmpty() || isDefaultDevAccount(user, providers)) {
				continue;
			}
			options.add(new DevLoginOptionResponse(user.id(), user.email(), user.displayName(), providers));
		}
		return new DevLoginOptionsResponse(options);
	}

	@Transactional
	public RootAuthSessionCreateResponse createDevLoginSession(DevLoginSessionRequest request) {
		if (!isDevLoginAllowed()) {
			throw new AuthSessionServiceException(404, "DEV_LOGIN_NOT_FOUND", "dev-login을 사용할 수 없습니다.");
		}
		String userId = request != null && request.create()
			? createDevLoginUser()
			: resolveDevLoginUserId(request == null ? null : request.accountKey());
		if (userId == null) {
			throw new AuthSessionServiceException(404, "DEV_LOGIN_USER_NOT_FOUND", "선택한 테스트 계정을 찾지 못했습니다.");
		}
		return createSession(userId);
	}

	@Transactional
	public AdminCheckResponse checkAdmin(AdminCheckRequest request) {
		String userId = normalizeString(request == null ? null : request.userId(), 64);
		var user = userId == null ? null : repository.findUserById(userId);
		if (user == null) {
			return new AdminCheckResponse(false);
		}
		if (ROLE_ADMIN.equals(user.role())) {
			return new AdminCheckResponse(true);
		}
		// 권한 상승 판정은 호출자 입력 email이 아니라 DB의 실제 user.email로만 수행한다(헤더/본문 신뢰 금지).
		String effectiveEmail = normalizeEmail(user.email());
		if (isSeedAdminEmail(effectiveEmail)) {
			repository.updateUserRole(user.id(), ROLE_ADMIN, OffsetDateTime.now(ZoneOffset.UTC));
			return new AdminCheckResponse(true);
		}
		return new AdminCheckResponse(false);
	}

	private AuthSessionRepository.UserRow upsertSocialLogin(SocialIdentityProfile profile, int attempt) {
		try {
			return upsertSocialLoginOnce(profile);
		} catch (DataIntegrityViolationException error) {
			// 동시 요청으로 인한 unique 충돌은 재조회 후 재시도로 흡수한다.
			if (attempt < SOCIAL_UPSERT_MAX_RETRIES) {
				return upsertSocialLogin(profile, attempt + 1);
			}
			throw error;
		}
	}

	private AuthSessionRepository.UserRow upsertSocialLoginOnce(SocialIdentityProfile profile) {
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		String normalizedEmail = normalizeEmail(profile.email());
		String normalizedVerifiedEmail = profile.emailVerified() ? normalizedEmail : null;
		String normalizedDisplayName = normalizeString(profile.displayName(), 80);
		String normalizedAvatarUrl = normalizeUrl(profile.avatarUrl());

		var existingIdentity = repository.findIdentityByProviderUser(profile.provider(), profile.providerUserId());
		if (existingIdentity != null) {
			var existingUser = repository.findUserById(existingIdentity.userId());
			if (existingUser == null) {
				throw new AuthSessionServiceException(500, "server_error", "연결된 사용자를 찾지 못했습니다.");
			}
			String nextEmail = normalizedVerifiedEmail == null ? existingUser.email() : normalizedVerifiedEmail;
			var updatedUser = repository.updateUserForLogin(existingUser.id(), nextEmail, normalizedDisplayName, normalizedAvatarUrl, now);
			repository.updateIdentity(existingIdentity.id(), normalizedVerifiedEmail, normalizedDisplayName, normalizedAvatarUrl, now);
			return updatedUser;
		}

		if (normalizedVerifiedEmail == null) {
			if (normalizedEmail == null) {
				throw new AuthSessionServiceException(400, "email_required", "이메일 제공 동의가 필요합니다.");
			}
			throw new AuthSessionServiceException(403, "email_not_verified", "검증된 이메일 계정만 로그인할 수 있습니다.");
		}

		var reusableUser = findReusableUser(normalizedVerifiedEmail, profile.provider(), profile.providerUserId());
		var targetUser = reusableUser == null
			? repository.insertUser(UUID.randomUUID().toString(), normalizedVerifiedEmail, normalizedDisplayName, normalizedAvatarUrl, now)
			: repository.updateUserForLogin(reusableUser.id(), normalizedVerifiedEmail, normalizedDisplayName, normalizedAvatarUrl, now);

		var sameProviderIdentity = repository.findIdentityByUserProvider(targetUser.id(), profile.provider());
		if (sameProviderIdentity == null) {
			if (reusableUser != null) {
				// 검증된 이메일 일치로 기존 계정에 새 provider identity가 자동 연결됨 — takeover 추적용 감사 로그.
				log.warn("social-link: 기존 계정({})에 새 provider({}) identity를 이메일 일치로 자동 연결", targetUser.id(), profile.provider());
			}
			repository.insertIdentity(UUID.randomUUID().toString(), targetUser.id(), profile.provider(), profile.providerUserId(), normalizedVerifiedEmail, normalizedDisplayName, normalizedAvatarUrl, now);
		}
		return targetUser;
	}

	private AuthSessionRepository.UserRow findReusableUser(String email, String provider, String providerUserId) {
		var candidate = repository.findUserByEmail(email);
		if (candidate == null) return null;
		var identities = repository.listIdentitiesByUserId(candidate.id());
		for (var identity : identities) {
			if (provider.equals(identity.provider()) && !providerUserId.equals(identity.providerUserId())) {
				return null;
			}
		}
		return candidate;
	}

	private String resolveDevLoginUserId(String accountKey) {
		if (accountKey == null || accountKey.isBlank() || DEV_LOGIN_DEFAULT_ACCOUNT_KEY.equals(accountKey)) {
			return findOrCreateDefaultDevUser().id();
		}
		var user = repository.findUserById(accountKey);
		if (user == null) return null;
		return repository.listProvidersByUserId(user.id()).isEmpty() ? null : user.id();
	}

	private AuthSessionRepository.UserRow findOrCreateDefaultDevUser() {
		var user = repository.findUserByEmail(DEV_USER_EMAIL);
		if (user == null) {
			user = repository.insertUser(UUID.randomUUID().toString(), DEV_USER_EMAIL, DEV_USER_DISPLAY_NAME, null, OffsetDateTime.now(ZoneOffset.UTC));
		}
		var identity = repository.findIdentityByProviderUser(DEV_PROVIDER, DEV_PROVIDER_USER_ID);
		if (identity == null) {
			repository.insertIdentity(UUID.randomUUID().toString(), user.id(), DEV_PROVIDER, DEV_PROVIDER_USER_ID, DEV_USER_EMAIL, DEV_USER_DISPLAY_NAME, null, OffsetDateTime.now(ZoneOffset.UTC));
		}
		return user;
	}

	private String createDevLoginUser() {
		String label = UUID.randomUUID().toString().substring(0, 8);
		String email = DEV_LOCAL_EMAIL_PREFIX + label + DEV_LOCAL_EMAIL_DOMAIN;
		String displayName = DEV_LOCAL_DISPLAY_NAME_PREFIX + label;
		String providerUserId = "dev-local-" + label + "-" + UUID.randomUUID().toString().substring(0, 8);
		String userId = UUID.randomUUID().toString();
		repository.insertUser(userId, email, displayName, null, OffsetDateTime.now(ZoneOffset.UTC));
		repository.insertIdentity(UUID.randomUUID().toString(), userId, DEV_PROVIDER, providerUserId, email, displayName, null, OffsetDateTime.now(ZoneOffset.UTC));
		return userId;
	}

	private RootAuthSessionCreateResponse createSession(String userId) {
		String sessionToken = tokenFactory.createToken();
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

	private AuthSessionResponse authenticated(AuthSessionRepository.UserRow user, List<String> providers) {
		return new AuthSessionResponse(true, new AuthSessionUserResponse(
			user.id(),
			user.email(),
			user.displayName(),
			user.avatarUrl(),
			user.lastLoginAt(),
			providers
		));
	}

	private AuthSessionResponse unauthenticated() {
		return new AuthSessionResponse(false, null);
	}

	private List<String> normalizeProviders(List<AuthSessionRepository.IdentityRow> identities) {
		return identities.stream()
			.map(AuthSessionRepository.IdentityRow::provider)
			.filter(this::isKnownProvider)
			.distinct()
			.sorted(Comparator.naturalOrder())
			.toList();
	}

	private boolean isDefaultDevAccount(AuthSessionRepository.UserRow user, List<String> providers) {
		return DEV_USER_EMAIL.equals(user.email()) && providers.size() == 1 && DEV_PROVIDER.equals(providers.getFirst());
	}

	private boolean isSocialProvider(String provider) {
		return "google".equals(provider) || "kakao".equals(provider);
	}

	private boolean isKnownProvider(String provider) {
		return isSocialProvider(provider) || DEV_PROVIDER.equals(provider);
	}

	private boolean isDevLoginAllowed() {
		return "true".equals(resolveEnv("ALLOW_DEV_LOGIN")) && !"production".equals(resolveEnv("NODE_ENV"));
	}

	private boolean isSeedAdminEmail(String email) {
		if (email == null) return false;
		String normalized = email.trim().toLowerCase();
		String raw = resolveEnv("YEON_ADMIN_EMAILS");
		if (raw == null || raw.isBlank()) raw = resolveEnv("ADMIN_EMAILS");
		if (raw == null) return false;
		for (String entry : raw.split(",")) {
			if (normalized.equals(entry.trim().toLowerCase())) return true;
		}
		return false;
	}

	private String resolveEnv(String name) {
		String value = environment.getProperty(name);
		if (value != null && !value.trim().isBlank()) return value.trim();
		String normalized = environment.getProperty(name.toLowerCase().replace('_', '.'));
		if (normalized != null && !normalized.trim().isBlank()) return normalized.trim();
		String env = System.getenv(name);
		return env == null || env.trim().isBlank() ? null : env.trim();
	}

	private String normalizeEmail(String value) {
		String normalized = normalizeString(value, 320);
		return normalized == null ? null : normalized.toLowerCase();
	}

	private String normalizeString(String value, int maxLength) {
		if (value == null) return null;
		String trimmed = value.trim();
		if (trimmed.isBlank()) return null;
		if (trimmed.length() <= maxLength) return trimmed;
		// surrogate pair 중간에서 잘리지 않도록 경계를 한 칸 앞으로 보정한다.
		int end = maxLength;
		if (Character.isHighSurrogate(trimmed.charAt(end - 1))) {
			end -= 1;
		}
		return trimmed.substring(0, end);
	}

	private String normalizeUrl(String value) {
		String normalized = normalizeString(value, 2048);
		if (normalized == null) return null;
		try {
			return java.net.URI.create(normalized).toString();
		} catch (IllegalArgumentException error) {
			return null;
		}
	}
}
