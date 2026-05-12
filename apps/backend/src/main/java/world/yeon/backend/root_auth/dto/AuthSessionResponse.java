package world.yeon.backend.root_auth.dto;

public record AuthSessionResponse(
	boolean authenticated,
	AuthSessionUserResponse user
) {}
