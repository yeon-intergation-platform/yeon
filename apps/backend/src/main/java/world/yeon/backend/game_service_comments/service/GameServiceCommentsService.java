package world.yeon.backend.game_service_comments.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import world.yeon.backend.game_service_comments.dto.CommentLikeResponse;
import world.yeon.backend.game_service_comments.dto.GameCommentDto;
import world.yeon.backend.game_service_comments.repository.GameServiceCommentsRepository;
import world.yeon.backend.game_service_comments.repository.GameServiceCommentsRepository.CommentRow;

@Service
public class GameServiceCommentsService {
	private static final int MAX_SLUG_LENGTH = 80;
	private static final int MAX_CONTENT_LENGTH = 1000;
	private static final int MAX_NICKNAME_LENGTH = 40;
	private static final int MIN_GUEST_PASSWORD_LENGTH = 4;
	// BCrypt 는 72바이트 초과분을 무시하므로 입력도 그 범위로 제한한다.
	private static final int MAX_GUEST_PASSWORD_LENGTH = 72;

	private final GameServiceCommentsRepository repository;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public GameServiceCommentsService(GameServiceCommentsRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public List<GameCommentDto> list(
		String gameSlug,
		UUID viewerUserId,
		boolean viewerIsAdmin,
		boolean sortPopular
	) {
		String slug = requireSlug(gameSlug);
		Set<UUID> likedIds = viewerUserId == null
			? Set.of()
			: repository.likedCommentIds(slug, viewerUserId);
		return repository.listByGame(slug, sortPopular).stream()
			.map(row -> toDto(row, viewerUserId, viewerIsAdmin, likedIds))
			.toList();
	}

	@Transactional
	public GameCommentDto create(
		String gameSlug,
		String content,
		boolean isSecret,
		UUID viewerUserId,
		String viewerName,
		String viewerAvatar,
		String guestNickname,
		String guestPassword
	) {
		String slug = requireSlug(gameSlug);
		String normalizedContent = requireText(content, "댓글 내용", 1, MAX_CONTENT_LENGTH);

		UUID authorUserId;
		String displayName;
		String avatarUrl;
		String guestPasswordHash;

		if (viewerUserId != null) {
			authorUserId = viewerUserId;
			displayName = normalizeNickname(viewerName, "사용자");
			avatarUrl = trimToNull(viewerAvatar);
			guestPasswordHash = null;
		} else {
			authorUserId = null;
			displayName = requireText(guestNickname, "닉네임", 1, MAX_NICKNAME_LENGTH);
			avatarUrl = null;
			String password = guestPassword == null ? "" : guestPassword;
			if (password.length() < MIN_GUEST_PASSWORD_LENGTH || password.length() > MAX_GUEST_PASSWORD_LENGTH) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"비밀번호는 " + MIN_GUEST_PASSWORD_LENGTH + "~" + MAX_GUEST_PASSWORD_LENGTH + "자여야 합니다.");
			}
			guestPasswordHash = passwordEncoder.encode(password);
		}

		CommentRow row = repository.insert(
			UUID.randomUUID(), slug, authorUserId, displayName, avatarUrl,
			guestPasswordHash, normalizedContent, isSecret
		);
		// 작성 직후 응답은 본인 글이므로 마스킹하지 않는다. 좋아요는 0에서 시작.
		return new GameCommentDto(
			row.id(), row.displayName(), row.avatarUrl(), row.content(), row.isSecret(),
			viewerUserId != null, authorUserId == null, false,
			true, 0L, false, row.createdAt()
		);
	}

	@Transactional(readOnly = true)
	public String reveal(UUID commentId, String password) {
		CommentRow row = requireComment(commentId);
		if (!row.isSecret()) {
			return row.content();
		}
		if (!row.hasGuestPassword()) {
			// 로그인 사용자의 비밀댓글은 비밀번호로 열람할 수 없다(작성자/운영자만).
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 비밀댓글은 작성자와 운영자만 볼 수 있습니다.");
		}
		verifyGuestPassword(commentId, password);
		return row.content();
	}

	@Transactional
	public boolean delete(UUID commentId, UUID viewerUserId, boolean viewerIsAdmin, String password) {
		CommentRow row = requireComment(commentId);
		if (viewerIsAdmin) {
			return repository.softDelete(commentId);
		}
		if (row.authorUserId() != null) {
			if (viewerUserId == null || !row.authorUserId().equals(viewerUserId)) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 댓글만 삭제할 수 있습니다.");
			}
			return repository.softDelete(commentId);
		}
		// 게스트 댓글은 비밀번호 확인으로만 삭제한다.
		verifyGuestPassword(commentId, password);
		return repository.softDelete(commentId);
	}

	@Transactional
	public CommentLikeResponse toggleLike(UUID commentId, UUID userId) {
		if (userId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "좋아요는 로그인 후 이용할 수 있습니다.");
		}
		if (!repository.commentExists(commentId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다.");
		}
		if (repository.commentLikeExists(commentId, userId)) {
			repository.removeCommentLike(commentId, userId);
		} else {
			repository.addCommentLike(UUID.randomUUID(), commentId, userId);
		}
		long count = repository.countCommentLikes(commentId);
		boolean liked = repository.commentLikeExists(commentId, userId);
		return new CommentLikeResponse(count, liked);
	}

	private GameCommentDto toDto(
		CommentRow row,
		UUID viewerUserId,
		boolean viewerIsAdmin,
		Set<UUID> likedIds
	) {
		boolean isGuest = row.authorUserId() == null;
		boolean isMine = viewerUserId != null && row.authorUserId() != null
			&& row.authorUserId().equals(viewerUserId);
		boolean canView = !row.isSecret() || isMine || viewerIsAdmin;
		boolean canRevealWithPassword = row.isSecret() && !canView && row.hasGuestPassword();
		boolean canDelete = isMine || viewerIsAdmin || isGuest;
		return new GameCommentDto(
			row.id(),
			row.displayName(),
			row.avatarUrl(),
			canView ? row.content() : null,
			row.isSecret(),
			isMine,
			isGuest,
			canRevealWithPassword,
			canDelete,
			row.likeCount(),
			likedIds.contains(row.id()),
			row.createdAt()
		);
	}

	private void verifyGuestPassword(UUID commentId, String password) {
		String hash = repository.findGuestPasswordHash(commentId);
		if (hash == null || password == null || !passwordEncoder.matches(password, hash)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비밀번호가 일치하지 않습니다.");
		}
	}

	private CommentRow requireComment(UUID commentId) {
		CommentRow row = repository.findById(commentId);
		if (row == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다.");
		}
		return row;
	}

	private static String requireSlug(String gameSlug) {
		String slug = trimToNull(gameSlug);
		if (slug == null || slug.length() > MAX_SLUG_LENGTH || !slug.matches("[a-z0-9-]+")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "gameSlug가 올바르지 않습니다.");
		}
		return slug;
	}

	private static String requireText(String value, String label, int min, int max) {
		String text = value == null ? "" : value.trim();
		if (text.length() < min || text.length() > max) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
				label + "은(는) " + min + "~" + max + "자여야 합니다.");
		}
		return text;
	}

	private static String normalizeNickname(String value, String fallback) {
		String text = trimToNull(value);
		if (text == null) return fallback;
		return text.length() > MAX_NICKNAME_LENGTH ? text.substring(0, MAX_NICKNAME_LENGTH) : text;
	}

	private static String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
