package world.yeon.backend.game_service_common.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.game_service_comments.controller.GameServiceCommentsController;
import world.yeon.backend.game_service_comments.service.GameServiceCommentsService;
import world.yeon.backend.game_service_common.service.GameServiceException;
import world.yeon.backend.game_service_library.controller.GameServiceLibraryController;
import world.yeon.backend.game_service_library.service.GameServiceLibraryService;
import world.yeon.backend.game_service_likes.controller.GameServiceLikesController;
import world.yeon.backend.game_service_likes.service.GameServiceLikesService;

@WebMvcTest({
	GameServiceCommentsController.class,
	GameServiceLibraryController.class,
	GameServiceLikesController.class
})
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class GameServiceErrorContractControllerTests {
	private static final UUID COMMENT_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private GameServiceCommentsService commentsService;
	@MockitoBean private GameServiceLibraryService libraryService;
	@MockitoBean private GameServiceLikesService likesService;

	@Test
	void 댓글좋아요인증오류는계약형코드를반환한다() throws Exception {
		when(commentsService.toggleLike(eq(COMMENT_ID), isNull()))
			.thenThrow(new GameServiceException(
				401,
				"GAME_COMMENT_LIKE_AUTH_REQUIRED",
				"좋아요는 로그인 후 이용할 수 있습니다."
			));

		mockMvc.perform(post("/game-service/comments/{id}/like", COMMENT_ID))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.code").value("GAME_COMMENT_LIKE_AUTH_REQUIRED"))
			.andExpect(jsonPath("$.message").value("좋아요는 로그인 후 이용할 수 있습니다."));
	}

	@Test
	void 라이브러리인증오류는계약형코드를반환한다() throws Exception {
		when(libraryService.listFavorites(isNull()))
			.thenThrow(new GameServiceException(401, "GAME_LIBRARY_AUTH_REQUIRED", "로그인이 필요합니다."));

		mockMvc.perform(get("/game-service/library/favorites"))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.code").value("GAME_LIBRARY_AUTH_REQUIRED"))
			.andExpect(jsonPath("$.message").value("로그인이 필요합니다."));
	}

	@Test
	void 게임좋아요슬러그오류는계약형코드를반환한다() throws Exception {
		when(likesService.status(eq("Bad Slug"), isNull()))
			.thenThrow(new GameServiceException(400, "GAME_SLUG_INVALID", "gameSlug가 올바르지 않습니다."));

		mockMvc.perform(get("/game-service/likes").param("gameSlug", "Bad Slug"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("GAME_SLUG_INVALID"))
			.andExpect(jsonPath("$.message").value("gameSlug가 올바르지 않습니다."));
	}
}
