package world.yeon.backend.public_check_locations.dto;

import java.util.List;

public record PublicCheckLocationSearchResponse(
	List<PublicCheckLocationResultResponse> results
) {}
