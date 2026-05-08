package world.yeon.backend.spaces.dto;

import java.util.List;

public record SpaceListResponse(
	List<SpaceResponse> spaces
) {}
