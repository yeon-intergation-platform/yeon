package world.yeon.backend.root_auth.dto;

public record DevLoginSessionRequest(
	String accountKey,
	boolean create
) {}
