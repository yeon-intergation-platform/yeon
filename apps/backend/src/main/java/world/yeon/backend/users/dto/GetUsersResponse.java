package world.yeon.backend.users.dto;

import java.util.List;

public record GetUsersResponse(
	List<UserResponse> users
) {}
