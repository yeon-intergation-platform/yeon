package world.yeon.backend.game_service_likes.dto;

import java.util.List;

public record GameLikeRankingResponse(List<Item> items) {
	public record Item(String gameSlug, long count) {}
}
