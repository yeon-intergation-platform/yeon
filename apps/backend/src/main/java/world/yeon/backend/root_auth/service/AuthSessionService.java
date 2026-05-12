package world.yeon.backend.root_auth.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.root_auth.dto.AuthSessionResponse;
import world.yeon.backend.root_auth.dto.AuthSessionUserResponse;
import world.yeon.backend.root_auth.repository.AuthSessionRepository;

@Service
public class AuthSessionService {
	private final AuthSessionRepository repository;
	private final AuthTokenHasher tokenHasher;

	public AuthSessionService(AuthSessionRepository repository, AuthTokenHasher tokenHasher) {
		this.repository = repository;
		this.tokenHasher = tokenHasher;
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
		return new AuthSessionResponse(true, new AuthSessionUserResponse(
			user.id(),
			user.email(),
			user.displayName(),
			user.avatarUrl(),
			user.lastLoginAt(),
			providers
		));
	}

	@Transactional
	public AuthSessionResponse deleteSession(String sessionToken) {
		if (sessionToken != null && !sessionToken.isBlank()) {
			repository.deleteSessionByTokenHash(tokenHasher.hash(sessionToken));
		}
		return unauthenticated();
	}

	private AuthSessionResponse unauthenticated() {
		return new AuthSessionResponse(false, null);
	}
}
