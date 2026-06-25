package world.yeon.backend.game_service_comments.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

// 비밀댓글 마스킹 시 content 는 null, isSecret=true, canRevealWithPassword 로 게스트 확인 가능 여부를 알린다.
public record GameCommentDto(
	UUID id,
	String displayName,
	String avatarUrl,
	String content,
	boolean isSecret,
	boolean isMine,
	boolean isGuest,
	boolean canRevealWithPassword,
	boolean canDelete,
	OffsetDateTime createdAt
) {}
