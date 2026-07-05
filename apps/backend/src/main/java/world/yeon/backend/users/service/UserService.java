package world.yeon.backend.users.service;

import jakarta.persistence.PersistenceException;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.users.dto.CreateUserRequest;
import world.yeon.backend.users.dto.CreateUserResponse;
import world.yeon.backend.users.dto.DeleteUserResponse;
import world.yeon.backend.users.dto.GetUsersResponse;
import world.yeon.backend.users.dto.InvalidateUserSessionsResponse;
import world.yeon.backend.users.dto.UpdateUserRequest;
import world.yeon.backend.users.dto.UpdateUserResponse;
import world.yeon.backend.users.dto.UpdateUserRoleRequest;
import world.yeon.backend.users.dto.UserResponse;
import world.yeon.backend.users.repository.UserRepository;

@Service
public class UserService {
	private static final String ADMIN_ROLE = "admin";
	private static final String USER_ROLE = "user";

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

	@Transactional
	public CreateUserResponse createUser(UUID userId, CreateUserRequest request) {
		requireAdmin(userId);
		String email = normalizeEmail(request == null ? null : request.email());
		String displayName = normalizeDisplayName(request == null ? null : request.displayName());
		if (email == null) {
			throw new IllegalArgumentException("이메일을 입력해 주세요.");
		}
		// 사전 findByEmail 중복검사는 race를 막지 못하므로 제거하고 unique(23505) 처리에 일원화한다.
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

	@Transactional
	public UpdateUserResponse updateUser(UUID actorUserId, UUID targetUserId, UpdateUserRequest request) {
		requireAdmin(actorUserId);
		requireExistingUser(targetUserId);
		String displayName = normalizeDisplayName(request == null ? null : request.displayName());
		var updated = repository.updateDisplayName(targetUserId, displayName, OffsetDateTime.now(ZoneOffset.UTC));
		if (updated == null) {
			throw new UserServiceException(404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
		}
		return new UpdateUserResponse(toResponse(updated));
	}

	@Transactional
	public UpdateUserResponse updateUserRole(UUID actorUserId, UUID targetUserId, UpdateUserRoleRequest request) {
		requireAdmin(actorUserId);
		requireExistingUser(targetUserId);
		String role = normalizeRole(request == null ? null : request.role());
		if (role == null) {
			throw new IllegalArgumentException("역할은 admin 또는 user만 사용할 수 있습니다.");
		}
		if (actorUserId.equals(targetUserId) && !ADMIN_ROLE.equals(role)) {
			throw new UserServiceException(409, "SELF_DEMOTION_BLOCKED", "본인의 관리자 권한은 직접 낮출 수 없습니다.");
		}
		var updated = repository.updateRole(targetUserId, role, OffsetDateTime.now(ZoneOffset.UTC));
		if (updated == null) {
			throw new UserServiceException(404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
		}
		return new UpdateUserResponse(toResponse(updated));
	}

	@Transactional
	public InvalidateUserSessionsResponse invalidateUserSessions(UUID actorUserId, UUID targetUserId) {
		requireAdmin(actorUserId);
		requireExistingUser(targetUserId);
		int deleted = repository.deleteSessionsByUserId(targetUserId);
		return new InvalidateUserSessionsResponse(targetUserId.toString(), deleted);
	}

	@Transactional
	public DeleteUserResponse deleteUser(UUID actorUserId, UUID targetUserId) {
		requireAdmin(actorUserId);
		requireExistingUser(targetUserId);
		if (actorUserId.equals(targetUserId)) {
			throw new UserServiceException(409, "SELF_DELETE_REQUIRES_WITHDRAWAL", "관리자 화면에서는 본인 계정을 삭제할 수 없습니다.");
		}
		return deleteExistingUser(targetUserId);
	}

	@Transactional
	public DeleteUserResponse deleteMe(UUID userId) {
		requireExistingUser(userId);
		return deleteExistingUser(userId);
	}

	private UserResponse toResponse(UserRepository.UserRow row) {
		return new UserResponse(
			row.id(),
			row.email(),
			row.displayName(),
			row.role(),
			row.lastLoginAt(),
			row.createdAt(),
			row.updatedAt(),
			row.emailVerifiedAt(),
			row.sessionCount(),
			row.identityProviders(),
			row.cardDeckCount(),
			row.typingDeckCount()
		);
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

	private void requireExistingUser(UUID userId) {
		if (userId == null || repository.findById(userId) == null) {
			throw new UserServiceException(404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
		}
	}

	private DeleteUserResponse deleteExistingUser(UUID userId) {
		int invalidatedSessions = repository.deleteSessionsByUserId(userId);
		int deleted = repository.deleteUser(userId);
		if (deleted < 1) {
			throw new UserServiceException(404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
		}
		return new DeleteUserResponse(userId.toString(), true, invalidatedSessions);
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

	private String normalizeRole(String raw) {
		if (raw == null) return null;
		String role = raw.trim().toLowerCase(Locale.ROOT);
		if (ADMIN_ROLE.equals(role) || USER_ROLE.equals(role)) return role;
		return null;
	}

	private static final String UNIQUE_VIOLATION_SQL_STATE = "23505";

	private boolean isDuplicateEmailError(Throwable error) {
		Throwable cursor = error;
		while (cursor != null) {
			if (cursor instanceof SQLException sqlException
				&& UNIQUE_VIOLATION_SQL_STATE.equals(sqlException.getSQLState())) {
				return true;
			}
			cursor = cursor.getCause();
		}
		return false;
	}
}
