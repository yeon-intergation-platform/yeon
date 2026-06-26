package world.yeon.backend.game_service_comments.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.game_service_comments.dto.GameCommentDto;
import world.yeon.backend.game_service_comments.service.GameServiceCommentsService;

@ExtendWith(MockitoExtension.class)
class GameServiceCommentsControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-4000-8000-000000000001");
	private static final UUID COMMENT_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");

	@Mock private GameServiceCommentsService service;
	private GameServiceCommentsController controller;

	@BeforeEach
	void setUp() {
		controller = new GameServiceCommentsController(service);
	}

	@Test
	void 댓글작성은인코딩된사용자헤더를원문으로복원한다() {
		var request = new GameServiceCommentsController.CreateRequest(
			"snake-io",
			"재밌어요",
			false,
			null,
			null
		);
		when(service.create(
			eq("snake-io"),
			eq("재밌어요"),
			eq(false),
			eq(USER_ID),
			eq("플레이어"),
			eq("https://cdn.yeon.world/avatar.png"),
			eq(null),
			eq(null)
		)).thenReturn(comment());

		controller.create(
			request,
			USER_ID,
			"%ED%94%8C%EB%A0%88%EC%9D%B4%EC%96%B4",
			"https%3A%2F%2Fcdn.yeon.world%2Favatar.png"
		);

		verify(service).create(
			eq("snake-io"),
			eq("재밌어요"),
			eq(false),
			eq(USER_ID),
			eq("플레이어"),
			eq("https://cdn.yeon.world/avatar.png"),
			eq(null),
			eq(null)
		);
	}

	private static GameCommentDto comment() {
		return new GameCommentDto(
			COMMENT_ID,
			"플레이어",
			"https://cdn.yeon.world/avatar.png",
			"재밌어요",
			false,
			true,
			false,
			false,
			true,
			0L,
			false,
			OffsetDateTime.parse("2026-06-26T00:00:00Z")
		);
	}
}
