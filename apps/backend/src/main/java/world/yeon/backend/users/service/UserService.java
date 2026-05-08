package world.yeon.backend.users.service;

import jakarta.persistence.PersistenceException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import world.yeon.backend.users.dto.CreateUserRequest;
import world.yeon.backend.users.dto.CreateUserResponse;
import world.yeon.backend.users.dto.GetUsersResponse;
import world.yeon.backend.users.dto.UserResponse;
import world.yeon.backend.users.repository.UserRepository;

@Service
@Profile("jdbc")
public class UserService {
	private final UserRepository repository;

	public UserService(UserRepository repository) {
		this.repository = repository;
	}

	public GetUsersResponse listUsers(UUID userId) {
		return new GetUsersResponse(repository.listUsers().stream().map(this::toResponse).toList());
	}

	public CreateUserResponse createUser(UUID userId, CreateUserRequest request) {
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
		return new UserResponse(row.id(), row.email(), row.displayName(), row.createdAt(), row.updatedAt());
	}

	private String normalizeEmail(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim().toLowerCase();
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
