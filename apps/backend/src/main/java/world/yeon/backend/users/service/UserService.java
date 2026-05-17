package world.yeon.backend.users.service;

import jakarta.persistence.PersistenceException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import world.yeon.backend.users.dto.CreateUserRequest;
import world.yeon.backend.users.dto.CreateUserResponse;
import world.yeon.backend.users.dto.GetUsersResponse;
import world.yeon.backend.users.dto.UserResponse;
import world.yeon.backend.users.repository.UserRepository;

@Service
public class UserService {
	private static final String ADMIN_ROLE = "admin";

	private final UserRepository repository;
	private final Set<String> adminSeedEmails;

	public UserService(
		UserRepository repository,
		@Value("${YEON_ADMIN_EMAILS:${ADMIN_EMAILS:}}") String adminEmails
	) {
		this.repository = repository;
		this.adminSeedEmails = parseAdminSeedEmails(adminEmails);
	}

	public GetUsersResponse listUsers(UUID userId) {
		requireAdmin(userId);
		return new GetUsersResponse(repository.listUsers().stream().map(this::toResponse).toList());
	}

	public CreateUserResponse createUser(UUID userId, CreateUserRequest request) {
		requireAdmin(userId);
		String email = normalizeEmail(request == null ? null : request.email());
		String displayName = normalizeDisplayName(request == null ? null : request.displayName());
		if (email == null) {
			throw new IllegalArgumentException("이메일을 입력해 주세요.");
		}
		if (repository.findByEmail(email) != null) {
			throw new UserServiceException(409, "DUPLICATE_EMAIL", "이미 등록된 이메일입니다.");
		}
		try {
			var created = repository.insertUser(UUID.randomUUID().toString(), email, displayName, OffsetDateTime.now(ZoneOffset.UTC));
			return new CreateUserResponse(toResponse(created));
		} catch (PersistenceException error) {
			if (isDuplicateEmailError(error)) {
				throw new UserServiceException(409, "DUPLICATE_EMAIL", "이미 등록된 이메일입니다.");
			}
			throw error;
		}
	}

	private UserResponse toResponse(UserRepository.UserRow row) {
		return new UserResponse(row.id(), row.email(), row.displayName(), row.role(), row.lastLoginAt(), row.createdAt(), row.updatedAt());
	}

	private void requireAdmin(UUID userId) {
		if (userId == null) {
			throw new UserServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다.");
		}
		var user = repository.findById(userId);
		if (user == null) {
			throw new UserServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다.");
		}
		if (ADMIN_ROLE.equals(user.role()) || adminSeedEmails.contains(normalizeEmail(user.email()))) {
			return;
		}
		throw new UserServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다.");
	}

	private static Set<String> parseAdminSeedEmails(String value) {
		if (value == null || value.isBlank()) {
			return Set.of();
		}
		return Arrays.stream(value.split(","))
			.map(email -> email.trim().toLowerCase(Locale.ROOT))
			.filter(email -> !email.isBlank())
			.collect(Collectors.toUnmodifiableSet());
	}

	private String normalizeEmail(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim().toLowerCase(Locale.ROOT);
		return trimmed.isBlank() ? null : trimmed;
	}

	private String normalizeDisplayName(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		if (trimmed.isBlank()) return null;
		return trimmed.length() <= 80 ? trimmed : trimmed.substring(0, 80);
	}

	private boolean isDuplicateEmailError(Throwable error) {
		Throwable cursor = error;
		while (cursor != null) {
			String message = cursor.getMessage();
			if (message != null && (message.contains("users_email") || message.contains("duplicate key") || message.contains("23505"))) {
				return true;
			}
			cursor = cursor.getCause();
		}
		return false;
	}
}
