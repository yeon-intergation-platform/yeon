package world.yeon.backend.user_experience.admin.service;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.user_experience.admin.dto.AdminUserCardDecksResponse;
import world.yeon.backend.user_experience.admin.dto.AdminUserCardDecksResponse.AdminCardDeckItem;
import world.yeon.backend.user_experience.admin.dto.AdminUserListResponse;
import world.yeon.backend.user_experience.admin.dto.AdminUserListResponse.AdminUserItem;
import world.yeon.backend.user_experience.admin.repository.AdminExperienceRepository;
import world.yeon.backend.user_experience.admin.repository.AdminExperienceRepository.AdminCardDeckRow;
import world.yeon.backend.user_experience.admin.repository.AdminExperienceRepository.AdminUserRow;
import world.yeon.backend.user_experience.domain.LevelCurve;
import world.yeon.backend.user_experience.service.ExperienceServiceException;
import world.yeon.backend.users.repository.UserRepository;

@Service
public class AdminExperienceService {
  private static final String ADMIN_ROLE = "admin";

  private final AdminExperienceRepository repository;
  private final UserRepository userRepository;
  private final Set<String> adminSeedEmails;

  public AdminExperienceService(
    AdminExperienceRepository repository,
    UserRepository userRepository,
    @Value("${YEON_ADMIN_EMAILS:${ADMIN_EMAILS:}}") String adminEmails
  ) {
    this.repository = repository;
    this.userRepository = userRepository;
    this.adminSeedEmails = parseAdminSeedEmails(adminEmails);
  }

  @Transactional(readOnly = true)
  public AdminUserListResponse listUsers(UUID callerUserId) {
    requireAdmin(callerUserId);
    var items = repository.listUsers().stream().map(this::toUserItem).toList();
    return new AdminUserListResponse(items);
  }

  @Transactional(readOnly = true)
  public AdminUserCardDecksResponse listCardDecks(UUID callerUserId, UUID targetUserId) {
    requireAdmin(callerUserId);
    if (targetUserId == null || !repository.userExists(targetUserId)) {
      throw new ExperienceServiceException(404, "USER_NOT_FOUND", "사용자를 찾지 못했습니다.");
    }
    var items = repository.listCardDecksForUser(targetUserId).stream().map(this::toCardDeckItem).toList();
    return new AdminUserCardDecksResponse(items);
  }

  private AdminUserItem toUserItem(AdminUserRow row) {
    int level = LevelCurve.levelForTotalXp(row.totalXp());
    return new AdminUserItem(row.id(), row.email(), row.displayName(), row.role(), level, row.totalXp(), row.cardDeckCount(), toIso(row.createdAt()));
  }

  private AdminCardDeckItem toCardDeckItem(AdminCardDeckRow row) {
    return new AdminCardDeckItem(row.publicId(), row.title(), row.description(), row.itemCount(), toIso(row.createdAt()), toIso(row.updatedAt()));
  }

  private String toIso(OffsetDateTime value) {
    return value == null ? null : value.toInstant().toString();
  }

  private void requireAdmin(UUID userId) {
    if (userId == null) {
      throw new ExperienceServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다.");
    }
    var user = userRepository.findById(userId);
    if (user == null) {
      throw new ExperienceServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다.");
    }
    if (ADMIN_ROLE.equals(user.role()) || adminSeedEmails.contains(normalizeEmail(user.email()))) {
      return;
    }
    throw new ExperienceServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다.");
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
}
