package world.yeon.backend.credential_auth.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.credential_auth.dto.CredentialLoginRequest;
import world.yeon.backend.credential_auth.dto.CredentialLoginResponse;
import world.yeon.backend.credential_auth.repository.CredentialAuthRepository;
import world.yeon.backend.root_auth.service.AuthTokenHasher;

@Service
public class CredentialAuthService {
	private static final int ACCOUNT_LOCK_WINDOW_MINUTES = 10;
	private static final int ACCOUNT_LOCK_FAIL_THRESHOLD = 5;
	private static final int IP_LOGIN_WINDOW_SECONDS = 60;
	private static final int IP_LOGIN_LIMIT_PER_MINUTE = 30;
	private static final long AUTH_SESSION_TTL_DAYS = 30;
	private static final String DUMMY_PASSWORD_HASH = "$argon2id$v=19$m=19456,t=2,p=1$Xu+TPzzniwWg9RGTAzu9Tw$uwr9XWBZfLvmf299GUvHF3rJqmo5o1hpXPsohSxtneI";

	private final CredentialAuthRepository repository;
	private final AuthTokenHasher tokenHasher;
	private final AuthSessionTokenFactory tokenFactory;
	private final Argon2PasswordEncoder passwordEncoder;

	public CredentialAuthService(
		CredentialAuthRepository repository,
		AuthTokenHasher tokenHasher,
		AuthSessionTokenFactory tokenFactory
	) {
		this.repository = repository;
		this.tokenHasher = tokenHasher;
		this.tokenFactory = tokenFactory;
		this.passwordEncoder = new Argon2PasswordEncoder(16, 32, 1, 19456, 2);
	}

	@Transactional
	public CredentialLoginResponse login(CredentialLoginRequest request) {
		String email = normalizeEmail(request == null ? null : request.email());
		String password = request == null ? null : request.password();
		String ipAddress = normalizeIpAddress(request == null ? null : request.ipAddress());
		if (email == null || password == null || password.isBlank()) {
			throw new CredentialAuthServiceException(400, "invalid_credentials", "이메일 또는 비밀번호가 올바르지 않습니다.");
		}

		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		if (isIpLoginRateLimited(ipAddress, now)) {
			throw new CredentialAuthServiceException(429, "rate_limit_exceeded", "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
		}

		if (isAccountLocked(email, now)) {
			throw new CredentialAuthServiceException(423, "account_locked", "로그인 시도가 너무 많아 계정이 잠시 잠겼습니다. 10분 후 다시 시도해 주세요.");
		}

		var credential = repository.findCredentialByEmail(email);
		if (credential == null || credential.passwordHash() == null) {
			runTimingSafeDummyVerify(password);
			recordFailure(email, ipAddress, now);
			throwInvalidCredentials();
		}

		if (!verifyPassword(password, credential.passwordHash())) {
			recordFailure(email, ipAddress, now);
			throwInvalidCredentials();
		}

		if (credential.emailVerifiedAt() == null) {
			recordFailure(email, ipAddress, now);
			throw new CredentialAuthServiceException(403, "email_not_verified", "이메일 인증이 완료되지 않았습니다. 받은 인증 메일의 링크를 눌러 인증을 완료해 주세요.");
		}

		repository.recordLoginAttempt(email, ipAddress, true, now);
		repository.updateLastLoginAt(credential.userId(), now);

		String sessionToken = tokenFactory.createToken();
		OffsetDateTime expiresAt = now.plusDays(AUTH_SESSION_TTL_DAYS);
		repository.insertAuthSession(UUID.randomUUID().toString(), credential.userId(), tokenHasher.hash(sessionToken), expiresAt, now);

		return new CredentialLoginResponse(credential.userId(), sessionToken, expiresAt);
	}

	private boolean isIpLoginRateLimited(String ipAddress, OffsetDateTime now) {
		OffsetDateTime since = now.minusSeconds(IP_LOGIN_WINDOW_SECONDS);
		return repository.countIpAttemptsSince(ipAddress, since) >= IP_LOGIN_LIMIT_PER_MINUTE;
	}

	private boolean isAccountLocked(String email, OffsetDateTime now) {
		OffsetDateTime since = now.minusMinutes(ACCOUNT_LOCK_WINDOW_MINUTES);
		return repository.countFailedEmailAttemptsSince(email, since) >= ACCOUNT_LOCK_FAIL_THRESHOLD;
	}

	private boolean verifyPassword(String password, String passwordHash) {
		try {
			return passwordEncoder.matches(password, passwordHash);
		} catch (RuntimeException error) {
			return false;
		}
	}

	private void runTimingSafeDummyVerify(String password) {
		verifyPassword(password, DUMMY_PASSWORD_HASH);
	}

	private void recordFailure(String email, String ipAddress, OffsetDateTime now) {
		repository.recordLoginAttempt(email, ipAddress, false, now);
	}

	private void throwInvalidCredentials() {
		throw new CredentialAuthServiceException(401, "invalid_credentials", "이메일 또는 비밀번호가 올바르지 않습니다.");
	}

	private String normalizeEmail(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim().toLowerCase();
		return trimmed.isBlank() ? null : trimmed;
	}

	private String normalizeIpAddress(String raw) {
		if (raw == null) return "unknown";
		String trimmed = raw.trim();
		return trimmed.isBlank() ? "unknown" : trimmed.substring(0, Math.min(trimmed.length(), 64));
	}
}
