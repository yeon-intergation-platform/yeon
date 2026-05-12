package world.yeon.backend.root_auth.dto;

import java.util.List;

public record DevLoginOptionsResponse(
	List<DevLoginOptionResponse> options
) {}
