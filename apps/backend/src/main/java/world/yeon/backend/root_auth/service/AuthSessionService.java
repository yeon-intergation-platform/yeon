package world.yeon.backend.root_auth.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.credential_auth.service.AuthSessionTokenFactory;
import world.yeon.backend.root_auth.dto.*;
import world.yeon.backend.root_auth.repository.AuthSessionRepository;
import world.yeon.backend.root_auth.social.SocialIdentityProfile;
import world.yeon.backend.root_auth.social.SocialIdentityProviderClient;

@Service
public class AuthSessionService {
	private static final long AUTH_SESSION_TTL_DAYS = 30;
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

	public AuthSessionService(
		AuthSessionRepository repository,
		AuthTokenHasher tokenHasher,
		AuthSessionTokenFactory tokenFactory,
		SocialIdentityProviderClient socialIdentityProviderClient,
		Environment environment
	) {
		this.repository = repository;
		this.tokenHasher = tokenHasher;
		this.tokenFactory = tokenFactory;
		this.socialIdentityProviderClient = socialIdentityProviderClient;
		this.environment = environment;
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

		repository.touchSession(session.id(), now);
		return authenticated(user, providers);
	}

	@Transactional
	public AuthSessionResponse deleteSession(String sessionToken) {
		if (sessionToken != null && !sessionToken.isBlank()) {
			repository.deleteSessionByTokenHash(tokenHasher.hash(sessionToken));
		}
		return unauthenticated();
	}

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
		String email = normalizeEmail(request == null ? null : request.email());
		var user = userId == null ? null : repository.findUserById(userId);
		if (user == null) {
			return new AdminCheckResponse(false);
		}
		if (ROLE_ADMIN.equals(user.role())) {
			return new AdminCheckResponse(true);
		}
		String effectiveEmail = email == null ? normalizeEmail(user.email()) : email;
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
			if (attempt < 1) {
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
		return new RootAuthSessionCreateResponse(userId, sessionToken, expiresAt);
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
		return trimmed.isBlank() ? null : trimmed.substring(0, Math.min(trimmed.length(), maxLength));
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
