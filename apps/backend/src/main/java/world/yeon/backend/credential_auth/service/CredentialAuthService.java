package world.yeon.backend.credential_auth.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.credential_auth.dto.*;
import world.yeon.backend.credential_auth.email.CredentialEmailTemplates;
import world.yeon.backend.credential_auth.email.ResendCredentialEmailSender;
import world.yeon.backend.credential_auth.repository.CredentialAuthRepository;
import world.yeon.backend.root_auth.service.AuthSessionService;
import world.yeon.backend.root_auth.service.AuthTokenHasher;

@Service
public class CredentialAuthService {
	private static final int ACCOUNT_LOCK_WINDOW_MINUTES = 10;
	private static final int ACCOUNT_LOCK_FAIL_THRESHOLD = 5;
	private static final int IP_LOGIN_WINDOW_SECONDS = 60;
	private static final int IP_LOGIN_LIMIT_PER_MINUTE = 30;
	private static final long AUTH_SESSION_TTL_DAYS = 30;
	private static final long VERIFICATION_TOKEN_TTL_HOURS = 24;
	private static final long RESET_TOKEN_TTL_HOURS = 1;
	private static final String DUMMY_PASSWORD_HASH = "$argon2id$v=19$m=19456,t=2,p=1$Xu+TPzzniwWg9RGTAzu9Tw$uwr9XWBZfLvmf299GUvHF3rJqmo5o1hpXPsohSxtneI";

	private final CredentialAuthRepository repository;
	private final AuthTokenHasher tokenHasher;
	private final AuthSessionTokenFactory tokenFactory;
	private final CredentialEmailRateLimiter emailRateLimiter;
	private final CredentialEmailTemplates emailTemplates;
	private final ResendCredentialEmailSender emailSender;
	private final AuthSessionService authSessionService;
	private final Argon2PasswordEncoder passwordEncoder;

	public CredentialAuthService(
		CredentialAuthRepository repository,
		AuthTokenHasher tokenHasher,
		AuthSessionTokenFactory tokenFactory,
		CredentialEmailRateLimiter emailRateLimiter,
		CredentialEmailTemplates emailTemplates,
		ResendCredentialEmailSender emailSender,
		AuthSessionService authSessionService
	) {
		this.repository = repository;
		this.tokenHasher = tokenHasher;
		this.tokenFactory = tokenFactory;
		this.emailRateLimiter = emailRateLimiter;
		this.emailTemplates = emailTemplates;
		this.emailSender = emailSender;
		this.authSessionService = authSessionService;
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

	@Transactional
	public CredentialRegisterResponse register(CredentialRegisterRequest request) {
		String email = normalizeEmail(request == null ? null : request.email());
		String password = request == null ? null : request.password();
		String ipAddress = normalizeIpAddress(request == null ? null : request.ipAddress());
		String displayName = normalizeDisplayName(request == null ? null : request.displayName());
		if (email == null || !isValidPassword(password)) {
			throw new CredentialAuthServiceException(400, "password_policy_violation", "입력 형식이 올바르지 않습니다.");
		}
		checkEmailRateLimit(ipAddress);

		var existing = repository.findAccountByEmail(email);
		if (existing != null && existing.hasCredential()) {
			throw new CredentialAuthServiceException(409, "email_already_registered", "이미 가입된 이메일입니다. 로그인 또는 비밀번호 재설정을 이용해 주세요.");
		}
		if (existing != null) {
			return new CredentialRegisterResponse(true, false);
		}

		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		String userId = UUID.randomUUID().toString();
		String verificationToken = UUID.randomUUID().toString();
		try {
			repository.insertCredentialUser(userId, email, displayName, hashPassword(password), verificationToken, now.plusHours(VERIFICATION_TOKEN_TTL_HOURS), now);
		} catch (DataIntegrityViolationException error) {
			return handleRegisterRace(email);
		}
		boolean sent = emailSender.send(email, emailTemplates.verification(verificationToken, request == null ? null : request.appOrigin()));
		return new CredentialRegisterResponse(false, sent);
	}

	@Transactional
	public void resendVerification(CredentialEmailRequest request) {
		String email = normalizeEmail(request == null ? null : request.email());
		String ipAddress = normalizeIpAddress(request == null ? null : request.ipAddress());
		if (email == null) return;
		checkEmailRateLimit(ipAddress);

		var account = repository.findAccountByEmail(email);
		if (account == null || account.emailVerifiedAt() != null || !account.hasCredential()) {
			enumerationDefenseDelay(100);
			return;
		}
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		String token = UUID.randomUUID().toString();
		repository.consumeOpenEmailVerificationTokens(account.userId(), now);
		repository.insertEmailVerificationToken(token, account.userId(), now.plusHours(VERIFICATION_TOKEN_TTL_HOURS), now);
		emailSender.send(email, emailTemplates.verification(token, request.appOrigin()));
	}

	@Transactional
	public void verifyEmail(CredentialVerifyEmailRequest request) {
		String token = normalizeToken(request == null ? null : request.token());
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		String userId = token == null ? null : repository.findActiveEmailVerificationUserId(token, now);
		if (userId == null) {
			throw new CredentialAuthServiceException(400, "invalid_verification_token", "인증 링크가 만료되었거나 사용할 수 없습니다. 새 인증 메일을 요청해 주세요.");
		}
		repository.consumeEmailVerificationToken(token, now);
		repository.markUserEmailVerified(userId, now);
	}

	@Transactional
	public void requestPasswordReset(CredentialEmailRequest request) {
		String email = normalizeEmail(request == null ? null : request.email());
		String ipAddress = normalizeIpAddress(request == null ? null : request.ipAddress());
		if (email == null) return;
		checkEmailRateLimit(ipAddress);

		var account = repository.findAccountByEmail(email);
		if (account == null || !account.hasCredential()) {
			enumerationDefenseDelay(120);
			return;
		}
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		String token = UUID.randomUUID().toString();
		repository.consumeOpenPasswordResetTokens(account.userId(), now);
		repository.insertPasswordResetToken(token, account.userId(), now.plusHours(RESET_TOKEN_TTL_HOURS), now);
		emailSender.send(email, emailTemplates.passwordReset(token, request.appOrigin()));
	}

	@Transactional
	public void confirmPasswordReset(CredentialResetConfirmRequest request) {
		String token = normalizeToken(request == null ? null : request.token());
		String newPassword = request == null ? null : request.newPassword();
		if (!isValidPassword(newPassword)) {
			throw new CredentialAuthServiceException(400, "password_policy_violation", "비밀번호는 최소 8자 이상 72자 이하로, 공백 없이 입력해 주세요.");
		}
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var reset = token == null ? null : repository.findActivePasswordResetToken(token, now);
		if (reset == null) {
			throw new CredentialAuthServiceException(400, "invalid_reset_token", "비밀번호 재설정 링크가 만료되었거나 사용할 수 없습니다. 재설정을 다시 요청해 주세요.");
		}
		repository.consumeOpenPasswordResetTokens(reset.userId(), now);
		repository.updatePasswordCredential(reset.userId(), hashPassword(newPassword), now);
		repository.deleteAuthSessionsByUserId(reset.userId());
		String email = repository.findEmailByUserId(reset.userId());
		if (email != null) {
			repository.deleteFailedLoginAttemptsByEmail(email.toLowerCase());
		}
	}

	@Transactional
	public void setPassword(String sessionToken, CredentialSetPasswordRequest request) {
		var session = authSessionService.getSession(sessionToken);
		if (!session.authenticated() || session.user() == null) {
			throw new CredentialAuthServiceException(401, "invalid_credentials", "로그인 후 이용해 주세요.");
		}
		String userId = session.user().id();
		var account = repository.findAccountByEmail(session.user().email());
		if (account != null && account.hasCredential()) {
			throw new CredentialAuthServiceException(409, "email_already_registered", "이미 비밀번호가 등록된 계정입니다. 비밀번호 재설정을 이용해 주세요.");
		}
		String password = request == null ? null : request.password();
		if (!isValidPassword(password)) {
			throw new CredentialAuthServiceException(400, "password_policy_violation", "비밀번호는 최소 8자 이상 72자 이하로, 공백 없이 입력해 주세요.");
		}
		try {
			repository.insertPasswordCredential(userId, hashPassword(password), OffsetDateTime.now(ZoneOffset.UTC));
		} catch (DataIntegrityViolationException error) {
			throw new CredentialAuthServiceException(409, "email_already_registered", "이미 비밀번호가 등록된 계정입니다. 비밀번호 재설정을 이용해 주세요.");
		}
	}

	private CredentialRegisterResponse handleRegisterRace(String email) {
		var race = repository.findAccountByEmail(email);
		if (race != null && race.hasCredential()) {
			throw new CredentialAuthServiceException(409, "email_already_registered", "이미 가입된 이메일입니다. 로그인 또는 비밀번호 재설정을 이용해 주세요.");
		}
		if (race != null) {
			return new CredentialRegisterResponse(true, false);
		}
		throw new CredentialAuthServiceException(409, "email_already_registered", "이미 가입된 이메일입니다. 로그인 또는 비밀번호 재설정을 이용해 주세요.");
	}

	private void checkEmailRateLimit(String ipAddress) {
		if (emailRateLimiter.isRateLimited(ipAddress)) {
			throw new CredentialAuthServiceException(429, "rate_limit_exceeded", "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
		}
	}

	private boolean isIpLoginRateLimited(String ipAddress, OffsetDateTime now) {
		OffsetDateTime since = now.minusSeconds(IP_LOGIN_WINDOW_SECONDS);
		return repository.countIpAttemptsSince(ipAddress, since) >= IP_LOGIN_LIMIT_PER_MINUTE;
	}

	private boolean isAccountLocked(String email, OffsetDateTime now) {
		OffsetDateTime since = now.minusMinutes(ACCOUNT_LOCK_WINDOW_MINUTES);
		return repository.countFailedEmailAttemptsSince(email, since) >= ACCOUNT_LOCK_FAIL_THRESHOLD;
	}

	private String hashPassword(String password) {
		return passwordEncoder.encode(password);
	}

	private boolean isValidPassword(String password) {
		return password != null && password.length() >= 8 && password.length() <= 72 && !password.chars().anyMatch(Character::isWhitespace);
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

	private void enumerationDefenseDelay(long millis) {
		try { Thread.sleep(millis); } catch (InterruptedException error) { Thread.currentThread().interrupt(); }
	}

	private String normalizeEmail(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim().toLowerCase();
		return trimmed.isBlank() ? null : trimmed;
	}

	private String normalizeDisplayName(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		return trimmed.isBlank() ? null : trimmed.substring(0, Math.min(trimmed.length(), 80));
	}

	private String normalizeIpAddress(String raw) {
		if (raw == null) return "unknown";
		String trimmed = raw.trim();
		return trimmed.isBlank() ? "unknown" : trimmed.substring(0, Math.min(trimmed.length(), 64));
	}

	private String normalizeToken(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		return trimmed.isBlank() ? null : trimmed;
	}
}
